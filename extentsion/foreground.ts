import { Messages } from './models/constants'
import { ExtensionJoinRoomPayload, ExtensionNewRoomPayload, ExtensionRoomPayload, ExtensionUserChangePayload } from './models/payloads';
import { MessageObject, ResponseObject,  } from './models/messagepassing';

import { SocketEvents, RoomAction, UserChange, VideoEvent } from '../sharedmodels/constants'
import {  SocketJoinRoomPayload, SocketRoomDataPayload, SocketUserChangePayload, SocketCreateVideoEventPayload, SocketGetVideoEventPayload, SocketSyncVideoPayload } from '../sharedmodels/payloads'
import { VideoData } from '../sharedmodels/videoData';

import { Socket, io } from 'socket.io-client'; 

var vidElem: HTMLVideoElement = document.querySelector('video')
var socket: Socket
var socketVideoEventHappened = {
    play: false,
    pause: false,
    seek: false,
    speed: false
}
var userJoined = false

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
    createSocketConnection(roomData, sendResponse)
}

const establishSocketConnectionForExistingRoom = (joinRoomData: ExtensionJoinRoomPayload, sendResponse) => {
    let roomData: SocketJoinRoomPayload = {roomName: null, userName: joinRoomData.userName, roomId: joinRoomData.roomId, action: RoomAction.JOIN}
    createSocketConnection(roomData, sendResponse)
}

const createSocketConnection = (roomData: SocketJoinRoomPayload, sendResponse) => {

    vidElem.onplay = function() {
        if (socketVideoEventHappened.play) {
            socketVideoEventHappened.play = false
            return
        }
        socket.emit(SocketEvents.VIDEO_EVENT, { 
            videoEvent: VideoEvent.PLAY, 
            videoData: retrieveVideoData(), 
            triggeringUserId: socket.id } as SocketCreateVideoEventPayload)
    }
    vidElem.onpause = function() {
        if (socketVideoEventHappened.pause) {
            socketVideoEventHappened.pause = false
            return
        }
        socket.emit(SocketEvents.VIDEO_EVENT, { 
            videoEvent: VideoEvent.PAUSE, 
            videoData: retrieveVideoData(), 
            triggeringUserId: socket.id } as SocketCreateVideoEventPayload)
    }
    vidElem.onseeked = function() {
        if (socketVideoEventHappened.seek) {
            socketVideoEventHappened.seek = false
            return
        }
        socket.emit(SocketEvents.VIDEO_EVENT, { 
            videoEvent: VideoEvent.SEEK, 
            videoData: retrieveVideoData(), 
            triggeringUserId: socket.id } as SocketCreateVideoEventPayload)
    }
    vidElem.onratechange = function() {
        if (socketVideoEventHappened.speed) {
            socketVideoEventHappened.speed = false
            return
        }
        socket.emit(SocketEvents.VIDEO_EVENT, { 
            videoEvent: VideoEvent.SPEED, 
            videoData: retrieveVideoData(), 
            triggeringUserId: socket.id } as SocketCreateVideoEventPayload)
    }

    //https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
    socket = io('http://localhost:3000',{ transports: ['websocket', 'polling', 'flashsocket'] });

    socket.emit(SocketEvents.JOIN, roomData, (err) => {
        socket.emit(SocketEvents.FORCE_DISCONNECT)
        alert(err)
    })

    socket.on(SocketEvents.ROOM_DATA, (data: SocketRoomDataPayload) => {
        data.room.users.find(user => user.userId === socket.id).current = true
        if (!userJoined) {
            userJoined = true
            sendResponse({
                status: Messages.SUCCESS,
                payload: {room: data.room}
            } as ResponseObject<ExtensionRoomPayload>)
        } else {
            chrome.runtime.sendMessage({
                message: Messages.TOPOPUP_ROOM_DATA,
                payload: {room: data.room}
            } as MessageObject<ExtensionRoomPayload>)
        }
    })

    socket.on(SocketEvents.USER_CHANGE, (data: SocketUserChangePayload) => {

        //NOTIFICATION HERE
    })

    //THEORETICALLY ONLY ADMIN SHOULD RECIEVE THIS
    socket.on(SocketEvents.SYNC_VIDEO_TO_ADMIN, (data: SocketSyncVideoPayload) => {
        socket.emit(SocketEvents.VIDEO_EVENT, { 
            videoEvent: data.userJoining ? VideoEvent.JOIN : VideoEvent.SYNC, 
            videoData: retrieveVideoData(), 
            userIdToSendTo: data.userId,
            triggeringUserId: socket.id,
            error: vidElem.readyState <= 2 ? 'Admins video is buffering. Please retry.' : null } as SocketCreateVideoEventPayload)
    })

    socket.on(SocketEvents.VIDEO_EVENT, (videoEventData: SocketGetVideoEventPayload) => {
        let elapsedTimeSinceRequestSec = (Date.now() - videoEventData.videoData.timestamp)/1000
        switch(videoEventData.videoEvent) {
            case(VideoEvent.SYNC):
            case(VideoEvent.JOIN):
                if(!!videoEventData.error) { // i.e admin is currently buffering
                    if (videoEventData.videoEvent === VideoEvent.JOIN) {
                        socket.emit(SocketEvents.FORCE_DISCONNECT)
                    }
                    alert(videoEventData.error)
                    return
                }
                socketVideoEventHappened.seek = true
                socketVideoEventHappened.speed = true
                vidElem.currentTime = videoEventData.videoData.playbackTime + elapsedTimeSinceRequestSec+0.5 // the +0.5 is to account for time it takes for vid to load
                if (videoEventData.videoData.playing) {
                    socketVideoEventHappened.play = true
                    vidElem.play()
                } else {
                    socketVideoEventHappened.pause = true
                    vidElem.pause()
                }
                vidElem.playbackRate = videoEventData.videoData.speed
                break;
            case(VideoEvent.PLAY):
                socketVideoEventHappened.play = true
                vidElem.play()
                break;
            case(VideoEvent.PAUSE):
                socketVideoEventHappened.pause = true
                vidElem.pause()
                break;
            case(VideoEvent.SPEED):
                socketVideoEventHappened.speed = true
                vidElem.playbackRate = videoEventData.videoData.speed
                break;
            case(VideoEvent.SEEK):
                socketVideoEventHappened.seek = true
                vidElem.currentTime = videoEventData.videoData.playbackTime + elapsedTimeSinceRequestSec 
                break
        }
    })
}

//https://stackoverflow.com/questions/6877403/how-to-tell-if-a-video-element-is-currently-playing
const retrieveVideoData = (): VideoData => {
    return {
        timestamp: Date.now(),
        playing: !!(vidElem.currentTime > 0 && !vidElem.paused && !vidElem.ended && vidElem.readyState > 2),
        speed: vidElem.playbackRate,
        playbackTime: vidElem.currentTime
    }
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
        if (vidElem?.offsetParent != null && vidElem?.offsetParent != undefined) {
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
        userJoined = false
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
    } else if (request.message === Messages.TOFG_SYNC_VID) {
        socket.emit(SocketEvents.SYNC_VIDEO_TO_ADMIN)
        return true
    }
});
