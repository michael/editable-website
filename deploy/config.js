/**
 * Deployment configuration
 * 
 * This file defines the secrets schema for your application.
 * Values go in .env.production (which is gitignored).
 * 
 * Add new secrets here as your app grows, then run:
 *   npm run deploy:secrets
 */

export default {
  secrets: {
    DB_PATH: {
      required: true,
      default: '/data/db.sqlite3',
      validate: (v) => v.endsWith('.sqlite3') || v.endsWith('.db'),
      hint: 'Path to SQLite database file',
    },
    ORIGIN: {
      required: true,
      validate: (v) => v.startsWith('https://') && !v.endsWith('/'),
      hint: 'Your site URL (auto-filled from app name, change if using custom domain)',
    },
    // Add more secrets as needed:
    // AUTH_SECRET: {
    //   required: true,
    //   validate: (v) => v.length >= 32,
    //   hint: 'Random string for session encryption (min 32 chars)',
    // },
  },
};
