import { Messages } from './models/constants'
import { ExtensionJoinRoomPayload, ExtensionNewRoomPayload, ExtensionRoomPayload, ExtensionUserChangePayload } from './models/payloads';
import { MessageObject, ResponseObject,  } from './models/messagepassing';

import { SocketEvents, RoomAction } from '../sharedmodels/constants'
import {  SocketJoinRoomPayload, SocketRoomDataPayload, SocketUserChangePayload } from '../sharedmodels/payloads'

import { Socket, io } from 'socket.io-client'; 

var vidElem: HTMLVideoElement = document.querySelector('video')
var socket: Socket

//https://learnersbucket.com/examples/javascript/unique-id-generator-in-javascript/
const guid = (): string => {
    let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    //return id of format 'aaaaaaaa'-'aaaa'-'aaaa'
    return s4() + s4() + '-' + s4() + '-' + s4();
}

const establishSocketConnectionForNewRoom = (newRoomData: ExtensionNewRoomPayload, sendResponse) => {
    //theoretically should be unique
    let roomId: string = guid()
    let roomData: SocketJoinRoomPayload = {roomName: newRoomData.roomName, userName: newRoomData.userName, roomId: roomId, action: RoomAction.CREATE}
    createSocketConnection(roomData, sendResponse, SocketEvents.CREATED_ROOM)
}

const establishSocketConnectionForExistingRoom = (joinRoomData: ExtensionJoinRoomPayload, sendResponse) => {
    let roomData: SocketJoinRoomPayload = {roomName: null, userName: joinRoomData.userName, roomId: joinRoomData.roomId, action: RoomAction.JOIN}
    createSocketConnection(roomData, sendResponse, SocketEvents.JOINED_ROOM)
}

const createSocketConnection = (roomData: SocketJoinRoomPayload, sendResponse, joinChannelEvent: string) => {

    //https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
    socket = io('http://localhost:3000',{ transports: ['websocket', 'polling', 'flashsocket'] });

    socket.emit(SocketEvents.JOIN, roomData, (err) => {
        alert(err)
    })
    socket.on(joinChannelEvent, (data: SocketRoomDataPayload) => {
        data.room.users.find(user => user.userId === socket.id).current = true
        sendResponse({
            status: Messages.SUCCESS,
            payload: {room: data.room}
        } as ResponseObject<ExtensionRoomPayload>)
    });

    socket.on(SocketEvents.ROOM_DATA, (data: SocketRoomDataPayload) => {
        data.room.users.find(user => user.userId === socket.id).current = true
        chrome.runtime.sendMessage({
            message: Messages.TOPOPUP_ROOM_DATA,
            payload: {room: data.room}
        } as MessageObject<ExtensionRoomPayload>)
    })
    socket.on(SocketEvents.USER_CONNECTED, (data: SocketUserChangePayload) => {
        chrome.runtime.sendMessage({
            message: Messages.TOPOPUP_USER_CONNECTED,
            payload: {message: data.message}
        } as MessageObject<ExtensionUserChangePayload>)
    })
    socket.on(SocketEvents.USER_DISCONNECTED, (data: SocketUserChangePayload) => {
    })
}

const retrieveRoomData = (sendResponse) => {
    socket.emit(SocketEvents.GET_ROOM_DATA)

    //this could be an issue with multiple of these socket connections being opened
    socket.on(SocketEvents.RECIEVE_ROOM_DATA, (data: SocketRoomDataPayload) => {
        data.room.users.find(user => user.userId === socket.id).current = true
        sendResponse({
            status: Messages.SUCCESS,
            payload: {room: data.room}
        } as ResponseObject<ExtensionRoomPayload>)
    })
}

chrome.runtime.onMessage.addListener((request: MessageObject<any>, sender, sendResponse) => {
    if (request.message === Messages.TOFG_VIDEO_ON_SCREEN) {
        vidElem = document.querySelector('video')
        if (vidElem != null && vidElem != undefined) {
            sendResponse({
                status: Messages.SUCCESS,
                payload: true
            } as ResponseObject<boolean>)
        } else {
            sendResponse({
                status: Messages.SUCCESS,
                payload: false
            } as ResponseObject<boolean>)
            alert("There must be a video on screen to create or join a room")
        }

        return true;
    }  else if (request.message === Messages.TOFG_CREATE_ROOM_IN_TAB) {
        establishSocketConnectionForNewRoom(<ExtensionNewRoomPayload>request.payload, sendResponse)
        return true
    } else if(request.message === Messages.TOFG_JOIN_ROOM_IN_TAB) {
        establishSocketConnectionForExistingRoom(<ExtensionJoinRoomPayload>request.payload, sendResponse)
        return true
    } else if (request.message === Messages.TOFG_DISCONNECT) {
        socket.emit(SocketEvents.FORCE_DISCONNECT)
        sendResponse({
            status: Messages.SUCCESS
        } as ResponseObject<null>)
    } else if (request.message === Messages.TOFG_RETRIEVE_ROOM_DATA) {
        retrieveRoomData(sendResponse)
        return true
    } else if (request.message === Messages.TOFG_DO_YOU_EXIST) {
        sendResponse({
            status: Messages.SUCCESS,
            payload: true
        } as ResponseObject<boolean>)
    } else if (request.message === Messages.TOFG_IS_CHANNEL_OPEN) {
        sendResponse({
            status: Messages.SUCCESS,
            payload: socket !== undefined && socket !== null
        } as ResponseObject<boolean>)
    }
});
