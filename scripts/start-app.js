import { server as app } from '/app/build/index.js';

function shutdownServer() {
	console.log('Server doing graceful shutdown');
	app.server.close();
}

process.on('SIGINT', shutdownServer);
process.on('SIGTERM', shutdownServer);
