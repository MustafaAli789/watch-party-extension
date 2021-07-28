//https://stackoverflow.com/questions/34528785/chrome-extension-checking-if-content-script-has-been-injected-or-not
// Wrapping in a function to not leak/modify variables if the script
// was already inserted before.
//Guard to make sure that were not injecting a script over and over when changing tabs back and forth
if (window.hasRun === true) {
    console.log("sike")
    //script ends here
} else {
    console.log("nvmm")
    window.hasRun = true;

    var Messages = {
        TOBG_VIDEO_ON_SCREEN: "tobg_validate_video_elem_on_screen",
        SUCCESS: "success",
        FAILURE: "failure",
        TOBG_CREATE_ROOM_IN_TAB: "tobg_create_room_in_tab",
        TOFG_VIDEO_ON_SCREEN: "tofg_validate_video_elem_on_screen",
        TOFG_CREATE_ROOM_IN_TAB: "tofg_create_room_in_tab",
        TOBG_DISCONNECT: "tobg_disconnect",
        TOFG_DISCONNECT: 'tofg_disconnect'
    }
    var SocketEvents = {
        JOIN: 'join',
        CREATED_ROOM: 'created_room',
        ROOM_USERS_DATA: 'room_users_data',
        JOINED_ROOM: 'joined_room',
        DISCONNECT: 'disconnect',
        USER_DISCONNECTED: 'user_disconnected',
        CONNECTION: 'connection',
        FORCE_DISCONNECT: 'force_disconnect'
    }
    var vidElem = document.querySelector('video')
    var socket

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

        //https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
        socket = io.connect('http://localhost:3000',{ transports: ['websocket', 'polling', 'flashsocket'] });

        //theoretically should be unique
        let roomId = guid()

        socket.emit(SocketEvents.JOIN, {roomName: roomName, userName: userName, roomId: roomId, action: "CREATE"}, (err) => {
            // shouldnt happen theoretically
            alert(err)
        })
        socket.on(SocketEvents.CREATED_ROOM, ({payload}) => {
            sendResponse({
                status: Messages.SUCCESS,
                payload: {users: payload, roomId: roomId}
            })
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
        }  else if (request.message === Messages.TOFG_CREATE_ROOM_IN_TAB) {
            establishSocketConnection(request.payload, sendResponse)
            return true
        } else if (request.message === Messages.TOFG_DISCONNECT) {
            socket.emit(SocketEvents.FORCE_DISCONNECT)
            sendResponse({
                status: Messages.SUCCESS
            })
        }
    });
}