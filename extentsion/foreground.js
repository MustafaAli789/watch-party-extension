//https://stackoverflow.com/questions/34528785/chrome-extension-checking-if-content-script-has-been-injected-or-not
// Wrapping in a function to not leak/modify variables if the script
// was already inserted before.
//Guard to make sure that were not injecting a script over and over when changing tabs back and forth
(function() {
    if (window.hasRun === true) {

        return true;  // Will ultimately be passed back to executeScript
    }
    window.hasRun = true;

    // rest of code ... 
    // No return value here, so the return value is "undefined" (without quotes).
})(); // <-- Invoke function. The return value is passed back to executeScript

const Messages = {
    TOBG_VIDEO_ON_SCREEN: "tobg_validate_video_elem_on_screen",
    SUCCESS: "success",
    FAILURE: "failure",
    TOBG_OPEN_CHANNEL_IN_TAB: "tobg_open_channel_in_tab",
    TOFG_VIDEO_ON_SCREEN: "tofg_validate_video_elem_on_screen",
    TOFG_OPEN_CHANNEL_IN_TAB: "tofg_open_channel_in_tab",
}

let vidElem = document.querySelector('video')

establishSocketConnection = (roomName) => {
    //https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
    var socket = io.connect('http://localhost:3000',{ transports: ['websocket', 'polling', 'flashsocket'] });
    socket.emit('join', {room: roomName})
    socket.on("joined_room",function(data){
        alert(data)
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === Messages.TOFG_VIDEO_ON_SCREEN) {
        vidElem = document.querySelector('video')
        if (vidElem != null && vidElem != undefined) {
            sendResponse({
                status: Messages.SUCCESS,
                payload: true
            })
        } else {
            sendResponse({
                status: Messages.SUCCESS,
                payload: false
            })
            alert("There must be a video on screen to create or join a room")
        }

        return true;
    }  else if (request.message === Messages.TOFG_OPEN_CHANNEL_IN_TAB) {
        establishSocketConnection(request.payload)
        sendResponse({
            status: Messages.SUCCESS,
            payload: {canJoin: true}
        })
    }
});