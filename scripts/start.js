/**
 * Production entry point for Fly.io
 * 
 * This script:
 * 1. Runs database migrations (if enabled)
 * 2. Starts the SvelteKit server
 * 3. Handles graceful shutdown on SIGTERM/SIGINT
 */

// Uncomment when migrations are ready:
// import migrate from '../src/sqlite/migrate.js';

// Run migrations before starting
// console.log('Running migrations...');
// migrate();
// console.log('Migrations complete');

// Graceful shutdown handler
function shutdown(signal) {
  console.log(`\nReceived ${signal}, shutting down gracefully...`);
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start SvelteKit server (this starts listening and keeps the process alive)
console.log('Starting server...');
await import('../build/index.js');
