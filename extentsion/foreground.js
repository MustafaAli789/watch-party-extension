//https://stackoverflow.com/questions/34528785/chrome-extension-checking-if-content-script-has-been-injected-or-not
// Wrapping in a function to not leak/modify variables if the script
// was already inserted before.
//Guard to make sure that were not injecting a script over and over when changing tabs back and forth
console.log('HELOOOO')
console.log(window.hasRun)
if (window.hasRun === true) {
    //script ends here
} else {
    window.hasRun = true;
    console.log(window.hasRun)

    if (typeof messages != undefined) {
        var Messages = {
            TOBG_VIDEO_ON_SCREEN: "tobg_validate_video_elem_on_screen",
            SUCCESS: "success",
            FAILURE: "failure",
            TOBG_OPEN_CHANNEL_IN_TAB: "tobg_open_channel_in_tab",
            TOFG_VIDEO_ON_SCREEN: "tofg_validate_video_elem_on_screen",
            TOFG_OPEN_CHANNEL_IN_TAB: "tofg_open_channel_in_tab",
        }
    }
    if (typeof vidElem != undefined) { 
        var vidElem = document.querySelector('video')
    }

    //https://learnersbucket.com/examples/javascript/unique-id-generator-in-javascript/
    guid = () => {
        let s4 = () => {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'
        return s4() + s4() + '-' + s4() + '-' + s4();
    }

    establishSocketConnection = ({roomName, userName}, sendResponse) => {

        const Events = {
            JOIN: 'join',
            CREATED_ROOM: 'created_room',
            ROOM_USERS_DATA: 'room_users_data',
            JOINED_ROOM: 'joined_room',
            DISCONNECT: 'disconnect',
            USER_DISCONNECTED: 'user_disconnected',
            CONNECTION: 'connection'
        }

        //https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
        var socket = io.connect('http://localhost:3000',{ transports: ['websocket', 'polling', 'flashsocket'] });

        //theoretically should be unique
        let roomId = guid()

        socket.emit(Events.JOIN, {roomName: roomName, userName: userName, roomId: roomId, action: "CREATE"}, (err) => {
            // shouldnt happen theoretically
            alert(err)
        })
        socket.on(Events.CREATED_ROOM, ({payload}) => {
            sendResponse({
                status: Messages.SUCCESS,
                payload: {canJoin: true}
            })
            alert(payload)
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
            console.log("weird")
            establishSocketConnection(request.payload, sendResponse)
        }
    });
}