//https://stackoverflow.com/questions/34528785/chrome-extension-checking-if-content-script-has-been-injected-or-not
// Wrapping in a function to not leak/modify variables if the script
// was already inserted before.
//Guard to make sure that were not injecting a script over and over when changing tabs back and forth
// (function() {
//     if (window.hasRun === true) {

//         return true;  // Will ultimately be passed back to executeScript
//     }
//     window.hasRun = true;

//     // rest of code ... 
//     // No return value here, so the return value is "undefined" (without quotes).
// })(); // <-- Invoke function. The return value is passed back to executeScript

let vidElem = document.querySelector('video')

//https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
var socket = io.connect('http://localhost:3000',{ transports: ['websocket', 'polling', 'flashsocket'] });
socket.on("hello",function(data){
    alert("WORKING")
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'video_on_screen') {
        if (document.querySelector('video') != null && document.querySelector('video') != undefined) {
            sendResponse({
                message: 'success',
                payload: true
            })
        } else {
            sendResponse({
                message: 'success',
                payload: false
            })
            alert("There must be a video on screen to create or join a room")
        }

        return true;
    } 
});