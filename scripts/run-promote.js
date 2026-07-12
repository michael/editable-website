// Side-effect entry point: promote any staged database before the server
// module is imported. Kept separate from start-app.js so the server can be
// imported statically — a top-level `await import()` there makes Node treat
// the module as having an unsettled top-level await and exit with code 13
// before the server starts listening.
import { promote_incoming } from './promote-db.js';

promote_incoming();
