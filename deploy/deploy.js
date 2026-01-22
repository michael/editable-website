#!/usr/bin/env node
/**
 * Deployment script for editable-website
 * 
 * Usage:
 *   node deploy/deploy.js init      # First-time setup (interactive)
 *   node deploy/deploy.js deploy    # Build and deploy to Fly.io
 *   node deploy/deploy.js secrets   # Sync secrets to Fly.io
 * 
 * Flags:
 *   --app=NAME    App name (for non-interactive init)
 *   --region=CODE Region code (for non-interactive init)
 */

import { execSync, spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// =============================================================================
// Helpers
// =============================================================================

function print_success(msg) { console.log(`\x1b[32m✓ ${msg}\x1b[0m`); }
function print_error(msg) { console.log(`\x1b[31m✗ ${msg}\x1b[0m`); }
function print_info(msg) { console.log(`\x1b[36mℹ ${msg}\x1b[0m`); }

function exec_sync(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return null;
  }
}

function exec_live(cmd, args) {
  return new Promise((resolve) => {
    const proc = spawn(cmd, args, { stdio: 'inherit' });
    proc.on('close', (code) => resolve(code || 0));
  });
}

function parse_env_file(path) {
  if (!existsSync(path)) return {};
  const content = readFileSync(path, 'utf-8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

async function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

// =============================================================================
// Validation
// =============================================================================

async function load_config() {
  const config_path = join(__dirname, 'config.js');
  const config = await import(config_path);
  return config.default;
}

function check_gitignore() {
  const gitignore_path = join(ROOT, '.gitignore');
  if (!existsSync(gitignore_path)) {
    print_error('.gitignore not found');
    return false;
  }
  const content = readFileSync(gitignore_path, 'utf-8');
  // Parse gitignore lines (exclude comments and empty lines)
  const lines = content.split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
  
  // Check for patterns that would ignore .env.production
  // Valid patterns: ".env.production", ".env.*", ".env*"
  const ignores_env_production = lines.some(line => 
    line === '.env.production' || 
    line === '.env.*' || 
    line === '.env*'
  );
  
  if (!ignores_env_production) {
    print_error('.env.production is NOT in .gitignore!');
    print_info('This file contains secrets and must never be committed.');
    print_info('Add ".env.production" to your .gitignore file.');
    return false;
  }
  return true;
}

function validate_app_name(name) {
  // Fly.io app names: lowercase, alphanumeric, hyphens, 3-63 chars
  if (!name || name.length < 3 || name.length > 63) {
    return 'App name must be 3-63 characters';
  }
  if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(name)) {
    return 'App name must be lowercase, alphanumeric, may include hyphens (not at start/end)';
  }
  return null; // Valid
}

function validate_secrets(config, env) {
  const errors = [];
  for (const [key, schema] of Object.entries(config.secrets)) {
    const value = env[key];
    if (schema.required && !value) {
      errors.push(`${key}: Required but not set. ${schema.hint || ''}`);
      continue;
    }
    if (value && schema.validate && !schema.validate(value)) {
      errors.push(`${key}: Invalid value "${value}". ${schema.hint || ''}`);
    }
  }
  return errors;
}

// =============================================================================
// Fly.io Adapter
// =============================================================================

const fly = {
  check_cli() {
    return exec_sync('which flyctl') !== null || exec_sync('which fly') !== null;
  },

  check_auth() {
    return exec_sync('fly auth whoami') !== null;
  },

  app_exists(name) {
    const result = exec_sync(`fly apps list --json`);
    if (!result) return false;
    try {
      const apps = JSON.parse(result);
      return apps.some(app => app.Name === name);
    } catch {
      return false;
    }
  },

  async create_app(name) {
    // Region is handled by fly.toml's primary_region during deploy
    const code = await exec_live('fly', ['apps', 'create', name, '--machines']);
    return code === 0;
  },

  async set_secrets(name, secrets) {
    const args = ['secrets', 'set', '-a', name];
    for (const [key, value] of Object.entries(secrets)) {
      if (value) args.push(`${key}=${value}`);
    }
    const code = await exec_live('fly', args);
    return code === 0;
  },

  async deploy() {
    const code = await exec_live('fly', ['deploy']);
    return code === 0;
  },
};

// =============================================================================
// Commands
// =============================================================================

async function cmd_init(flags) {
  console.log('\n  Fly.io Deployment Setup\n');

  // Check prerequisites
  if (!fly.check_cli()) {
    print_error('Fly CLI not found');
    print_info('Install: curl -L https://fly.io/install.sh | sh');
    process.exit(1);
  }

  if (!fly.check_auth()) {
    print_error('Not logged in to Fly.io');
    print_info('Run: fly auth login');
    process.exit(1);
  }

  let app_name = flags.app;
  let region = flags.region || 'fra';

  // Interactive mode if flags not provided
  if (!app_name) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    
    app_name = await prompt(rl, '  App name: ');
    if (!app_name) {
      print_error('App name is required');
      rl.close();
      process.exit(1);
    }
    
    const name_error = validate_app_name(app_name);
    if (name_error) {
      print_error(name_error);
      rl.close();
      process.exit(1);
    }

    const region_input = await prompt(rl, '  Region [fra]: ');
    if (region_input) region = region_input;

    // Check if files already exist
    const existing_files = [
      existsSync(join(ROOT, 'fly.toml')) && 'fly.toml',
      existsSync(join(ROOT, 'Dockerfile')) && 'Dockerfile',
    ].filter(Boolean);

    if (existing_files.length > 0) {
      console.log(`\n  Files already exist: ${existing_files.join(', ')}`);
      const confirm = await prompt(rl, '  Overwrite? [y/N]: ');
      if (confirm.toLowerCase() !== 'y') {
        print_info('Init cancelled');
        rl.close();
        process.exit(0);
      }
    }

    rl.close();
  } else {
    // Non-interactive mode: validate app name
    const name_error = validate_app_name(app_name);
    if (name_error) {
      print_error(name_error);
      process.exit(1);
    }

    // Check for existing files
    const existing_files = [
      existsSync(join(ROOT, 'fly.toml')) && 'fly.toml',
      existsSync(join(ROOT, 'Dockerfile')) && 'Dockerfile',
    ].filter(Boolean);

    if (existing_files.length > 0 && !flags.force) {
      print_error(`Files already exist: ${existing_files.join(', ')}`);
      print_info('Use --force to overwrite');
      process.exit(1);
    }
  }

  console.log('');

  // Copy templates to root
  const template_dir = join(__dirname, 'templates', 'fly');
  
  // fly.toml
  let fly_toml = readFileSync(join(template_dir, 'fly.toml'), 'utf-8');
  fly_toml = fly_toml.replace(/\{\{APP_NAME\}\}/g, app_name);
  fly_toml = fly_toml.replace(/\{\{REGION\}\}/g, region);
  writeFileSync(join(ROOT, 'fly.toml'), fly_toml);
  print_success('Created fly.toml');

  // Dockerfile
  copyFileSync(join(template_dir, 'Dockerfile'), join(ROOT, 'Dockerfile'));
  print_success('Created Dockerfile');

  // .env.production.example
  const config = await load_config();
  let env_example = '# Deployment secrets\n# Copy to .env.production and fill in values\n\n';
  for (const [key, schema] of Object.entries(config.secrets)) {
    if (schema.hint) env_example += `# ${schema.hint}\n`;
    // Derive ORIGIN from app name
    let default_value = schema.default || '';
    if (key === 'ORIGIN') {
      default_value = `https://${app_name}.fly.dev`;
    }
    env_example += `${key}=${default_value}\n\n`;
  }
  writeFileSync(join(ROOT, '.env.production.example'), env_example);
  print_success('Created .env.production.example');

  console.log('\n  Next steps:\n');
  console.log('    1. cp .env.production.example .env.production');
  console.log('    2. Edit .env.production with your values');
  console.log('    3. npm run build && npm run deploy\n');
}

async function cmd_secrets() {
  console.log('');

  // Check prerequisites
  if (!fly.check_cli()) {
    print_error('Fly CLI not found');
    print_info('Install: curl -L https://fly.io/install.sh | sh');
    process.exit(1);
  }

  if (!fly.check_auth()) {
    print_error('Not logged in to Fly.io');
    print_info('Run: fly auth login');
    process.exit(1);
  }

  if (!check_gitignore()) process.exit(1);

  const env_path = join(ROOT, '.env.production');
  if (!existsSync(env_path)) {
    print_error('.env.production not found');
    print_info('Run: cp .env.production.example .env.production');
    process.exit(1);
  }

  // Load and validate
  const config = await load_config();
  const env = parse_env_file(env_path);
  const errors = validate_secrets(config, env);

  if (errors.length > 0) {
    print_error('Secrets validation failed:\n');
    for (const err of errors) console.log(`  • ${err}`);
    console.log('');
    process.exit(1);
  }

  print_success('Secrets validated');

  // Get app name from fly.toml
  const fly_toml_path = join(ROOT, 'fly.toml');
  if (!existsSync(fly_toml_path)) {
    print_error('fly.toml not found. Run: npm run deploy:init');
    process.exit(1);
  }

  const fly_toml = readFileSync(fly_toml_path, 'utf-8');
  const app_match = fly_toml.match(/app\s*=\s*['"]([^'"]+)['"]/);
  if (!app_match) {
    print_error('Could not read app name from fly.toml');
    process.exit(1);
  }
  const app_name = app_match[1];

  // Check app exists on Fly
  if (!fly.app_exists(app_name)) {
    print_error(`App "${app_name}" not found on Fly.io`);
    print_info('Run: npm run deploy first (it will create the app)');
    process.exit(1);
  }

  // Sync secrets
  print_info(`Syncing secrets to ${app_name}...`);
  const success = await fly.set_secrets(app_name, env);
  
  if (success) {
    print_success('Secrets synced to Fly.io');
  } else {
    print_error('Failed to sync secrets');
    process.exit(1);
  }
}

async function cmd_deploy() {
  console.log('');

  // Check prerequisites
  if (!fly.check_cli()) {
    print_error('Fly CLI not found');
    print_info('Install: curl -L https://fly.io/install.sh | sh');
    process.exit(1);
  }

  if (!fly.check_auth()) {
    print_error('Not logged in to Fly.io');
    print_info('Run: fly auth login');
    process.exit(1);
  }

  if (!check_gitignore()) process.exit(1);

  // Check fly.toml exists
  const fly_toml_path = join(ROOT, 'fly.toml');
  if (!existsSync(fly_toml_path)) {
    print_error('fly.toml not found');
    print_info('Run: npm run deploy:init');
    process.exit(1);
  }

  // Validate secrets
  const env_path = join(ROOT, '.env.production');
  if (!existsSync(env_path)) {
    print_error('.env.production not found');
    print_info('Run: cp .env.production.example .env.production');
    process.exit(1);
  }

  const config = await load_config();
  const env = parse_env_file(env_path);
  const errors = validate_secrets(config, env);

  if (errors.length > 0) {
    print_error('Secrets validation failed:\n');
    for (const err of errors) console.log(`  • ${err}`);
    console.log('');
    process.exit(1);
  }

  print_success('Secrets validated');

  // Get app name
  const fly_toml = readFileSync(fly_toml_path, 'utf-8');
  const app_match = fly_toml.match(/app\s*=\s*['"]([^'"]+)['"]/);
  if (!app_match) {
    print_error('Could not read app name from fly.toml');
    process.exit(1);
  }
  const app_name = app_match[1];

  // Check if app exists, create if not
  if (!fly.app_exists(app_name)) {
    print_info(`App "${app_name}" not found on Fly.io, creating...`);
    
    if (!await fly.create_app(app_name)) {
      print_error('Failed to create app');
      process.exit(1);
    }
    print_success(`Created app "${app_name}"`);

    // Set secrets on first deploy
    print_info('Setting secrets...');
    if (!await fly.set_secrets(app_name, env)) {
      print_error('Failed to set secrets');
      process.exit(1);
    }
    print_success('Secrets configured');
  }

  // Deploy
  print_info('Deploying to Fly.io...');
  console.log('');
  
  const success = await fly.deploy();
  
  console.log('');
  if (success) {
    print_success(`Deployed to https://${app_name}.fly.dev`);
  } else {
    print_error('Deployment failed');
    print_info(`Check logs: fly logs -a ${app_name}`);
    process.exit(1);
  }
}

// =============================================================================
// CLI Entry Point
// =============================================================================

function parse_flags(args) {
  const flags = {};
  for (const arg of args) {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      flags[key] = value || true;
    }
  }
  return flags;
}

const args = process.argv.slice(2);
const command = args.find(a => !a.startsWith('--'));
const flags = parse_flags(args);

switch (command) {
  case 'init':
    cmd_init(flags);
    break;
  case 'secrets':
    cmd_secrets();
    break;
  case 'deploy':
    cmd_deploy();
    break;
  default:
    console.log(`
  Usage: node deploy/deploy.js <command>

  Commands:
    init      First-time setup (creates fly.toml, Dockerfile)
    deploy    Build and deploy to Fly.io
    secrets   Validate and sync secrets to Fly.io

  Flags (for init):
    --app=NAME     App name
    --region=CODE  Region code (default: fra)
    --force        Overwrite existing files

  Examples:
    npm run deploy:init
    npm run deploy:init -- --app=my-site --region=fra
    npm run deploy
    npm run deploy:secrets
`);
}
