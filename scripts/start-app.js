// `run-promote.js` runs first (imports evaluate in source order), swapping in
// any staged database before the server module below opens its connection.
import './run-promote.js';
import { server as app } from '/app/build/index.js';

function shutdownServer() {
	console.log('Server doing graceful shutdown');
	app.server.close();
}

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);
