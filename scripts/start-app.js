// `run-promote.js` runs first (imports evaluate in source order), swapping in
// any staged database before the server module below opens its connection.
// `run-cloud-boot.js` follows: disaster recovery from the backup bucket (only
// on an empty volume) and the litestream replication sidecar — no-op unless
// BUCKET_NAME is set.
import './run-promote.js';
import './run-cloud-boot.js';
import { server as app } from '/app/build/index.js';

function shutdownServer() {
	console.log('Server doing graceful shutdown');
	app.server.close();
}

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);
