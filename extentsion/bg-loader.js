//manifest v3 forces u to do this if u want multip background scripts
//https://stackoverflow.com/questions/66406672/chrome-extension-mv3-modularize-service-worker-js-file
try {
    importScripts('./socketio/socket.io.js', 'background.js');
} catch (e) {
    console.error(e);
}