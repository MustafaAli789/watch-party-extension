//https://stackoverflow.com/questions/34528785/chrome-extension-checking-if-content-script-has-been-injected-or-not
// Wrapping in a function to not leak/modify variables if the script
// was already inserted before.
//Guard to make sure that were not injecting a script over and over when changing tabs back and forth
import { Messages } from './models/constants'
import SocketEvents from '../socketEvents'
import { Socket, io } from 'socket.io-client'; 

var vidElem: HTMLVideoElement = document.querySelector('video')
var socket: Socket

//https://learnersbucket.com/examples/javascript/unique-id-generator-in-javascript/
const guid = (): String => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'
    return s4() + s4() + '-' + s4() + '-' + s4();
}

const establishSocketConnection = ({roomName, userName}, sendResponse) => {

    //https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
    socket = io('http://localhost:3000',{ transports: ['websocket', 'polling', 'flashsocket'] });

    //theoretically should be unique
    let roomId: String = guid()

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
