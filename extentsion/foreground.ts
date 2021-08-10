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

var notifContainer = document.createElement('DIV')
notifContainer.id = "notifContainer"
notifContainer.classList.add('toast-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3')
document.querySelector('body').appendChild(notifContainer)
var notifCount = 0

var isSeeking = false;
var seekedTimeout;
var SEEKEVENT_TIMEOUT = 50;

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
        if (!isSeeking) {
            socket.emit(SocketEvents.VIDEO_EVENT, { 
                videoEvent: VideoEvent.PLAY, 
                videoData: retrieveVideoData(), 
                triggeringUserId: socket.id } as SocketCreateVideoEventPayload)
        } else {
            let videoData = retrieveVideoData()
            videoData.playing = true //dont know why it isnt ready state isnt > 2 here but oh well

            // case: when vid is playing and someone seeks vid by dragging or clicking some time
            socket.emit(SocketEvents.VIDEO_EVENT, { 
                videoEvent: VideoEvent.SEEK, 
                videoData: videoData, 
                triggeringUserId: socket.id } as SocketCreateVideoEventPayload)
        }
    }
    vidElem.onpause = function() {
        if (socketVideoEventHappened.pause) {
            socketVideoEventHappened.pause = false
            return
        }
        seekedTimeout = setTimeout(() => {
            socket.emit(SocketEvents.VIDEO_EVENT, { 
                videoEvent: VideoEvent.PAUSE, 
                videoData: retrieveVideoData(), 
                triggeringUserId: socket.id } as SocketCreateVideoEventPayload)
        }, SEEKEVENT_TIMEOUT)
    }

    // when u seek either by dragging current point or clicking somewhere in time it goes pause --> seeking --> play --> seeked
    vidElem.onseeking = function() {
        clearTimeout(seekedTimeout)
        isSeeking = true
    }
    vidElem.onseeked = function() {
        isSeeking = false
        if (socketVideoEventHappened.seek) {
            socketVideoEventHappened.seek = false
            return
        }
        //case: when vid is paused and someone seeks vid by dragging or clicking some time
        if (vidElem.paused) {
            socket.emit(SocketEvents.VIDEO_EVENT, { 
                videoEvent: VideoEvent.SEEK, 
                videoData: retrieveVideoData(), 
                triggeringUserId: socket.id } as SocketCreateVideoEventPayload)
        }
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
        addNotif({ headerMsg: 'Join Error', bodyMsg: err, type: 'ERROR' })
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
        if (data.changeEvent === UserChange.JOIN) {
            addNotif({ headerMsg: 'User Joined', type: 'NOTIF', bodyMsg:  `User ${data.changedUser.userName} joined room.` })
        } else if (data.changeEvent === UserChange.DISCONNECT) {
            addNotif({ headerMsg: 'User Left', type: 'NOTIF', bodyMsg:  `User ${data.changedUser.userName} left room.` })
        }
    })

    //THEORETICALLY ONLY ADMIN SHOULD RECIEVE THIS
    socket.on(SocketEvents.SYNC_VIDEO, (data: SocketSyncVideoPayload) => {
        let errMsg
        if (data.userRequestingSync.admin) {
            errMsg = 'User being synced to is buffering. Please retry.'
        } else {
            errMsg = 'Admins video is buffering. Please retry.'
        }
        socket.emit(SocketEvents.VIDEO_EVENT, { 
            videoEvent: data.userJoining ? VideoEvent.JOIN : VideoEvent.SYNC, 
            videoData: retrieveVideoData(), 
            userIdToSendTo: data.userRequestingSync.userId,
            triggeringUserId: socket.id,
            error: vidElem.readyState <= 2 ? errMsg : null } as SocketCreateVideoEventPayload)
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
                vidElem.currentTime = videoEventData.videoData.playbackTime + elapsedTimeSinceRequestSec+0.5 // the +0.5 is to account for time it takes for vid to load
                
                if (videoEventData.videoData.playing && vidElem.paused) {
                    socketVideoEventHappened.play = true
                    vidElem.play()
                } else if(!videoEventData.videoData.playing && !vidElem.paused) {
                    socketVideoEventHappened.pause = true
                    vidElem.pause()
                }

                if (vidElem.playbackRate !== videoEventData.videoData.speed) {
                    socketVideoEventHappened.speed = true
                    vidElem.playbackRate = videoEventData.videoData.speed
                }
                

                if (videoEventData.videoEvent === VideoEvent.SYNC) {
                    if (videoEventData.triggeringUser.admin) {
                        addNotif({ headerMsg: 'Synced to admin', type: 'SUCCESS', bodyMsg: 'Successfuly synced to admin' })
                    } else {
                        addNotif({ headerMsg: 'Synced to group', type: 'SUCCESS', bodyMsg: 'Successfuly synced to group' })
                    }
                }

                break;
            case(VideoEvent.PLAY):
                socketVideoEventHappened.play = true
                vidElem.play()
                addNotif({ headerMsg: 'Play Video', type: 'NOTIF', bodyMsg:  `User ${videoEventData.triggeringUser.userName} played video.` })
                break;
            case(VideoEvent.PAUSE):
                socketVideoEventHappened.pause = true
                vidElem.pause()
                addNotif({ headerMsg: 'Pause Video', type: 'NOTIF', bodyMsg:  `User ${videoEventData.triggeringUser.userName} paused video.` })
                break;
            case(VideoEvent.SPEED):
                socketVideoEventHappened.speed = true
                vidElem.playbackRate = videoEventData.videoData.speed
                addNotif({ headerMsg: 'Change Video Speed', type: 'NOTIF', bodyMsg:  `User ${videoEventData.triggeringUser.userName} changed video speed to ${videoEventData.videoData.speed}.` })
                break;
            case(VideoEvent.SEEK):
                socketVideoEventHappened.seek = true
                vidElem.currentTime = videoEventData.videoData.playbackTime + elapsedTimeSinceRequestSec 
                
                let timeSeekedReadable = new Date(videoEventData.videoData.playbackTime * 1000).toISOString().substr(11, 8)
                if (videoEventData.videoData.playing && vidElem.paused) {
                    socketVideoEventHappened.play = true
                    vidElem.play()
                }
                addNotif({ headerMsg: 'Seek Video', type: 'NOTIF', bodyMsg:  `User ${videoEventData.triggeringUser.userName} seeked video to ${timeSeekedReadable}.` })
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
            addNotif({ headerMsg: 'Video Missing Error', bodyMsg: "There must be a video on screen to create or join a room", type: 'ERROR' })
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
        socket.emit(SocketEvents.SYNC_VIDEO, {}, (err) => {
            addNotif({ headerMsg: 'Sync Error', bodyMsg: err, type: 'ERROR' })
        })
        return true
    }
});

const addNotif = (data: { headerMsg: string, bodyMsg: string, type: 'ERROR' | 'NOTIF' | 'SUCCESS' }) => {
    notifCount++
    let toast = document.createElement('DIV');
    toast.id = `toast${notifCount}`

    let color = data.type === 'ERROR' ? 'red' : (data.type === 'NOTIF' ? 'blue' : 'green')
    toast.innerHTML = `<div style="z-index: 9999" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" style="display: block">
            <div class="toast-header">
                <div class="rounded me-2" style="width: 25px;height: 25px;background-color: ${color}"></div>
                <strong class="me-auto" style="font-size: 20px;color: ${color}">${data.headerMsg}</strong>
                <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
            <div class="toast-body" style="font-size: 15px;">
                ${data.bodyMsg}
            </div>
        </div>
    </div>`
    notifContainer.appendChild(toast)

    let notifCloseTimeout = setTimeout(() => {
        removeNotif(toast.id)
    }, 3000)
    toast.querySelector('button').addEventListener('click', () => {
        clearTimeout(notifCloseTimeout)
        removeNotif(toast.id)
    })
}

const removeNotif = (toastId: string) => {
    let toast = document.getElementById(toastId)
    toast.parentElement.removeChild(toast)
    notifCount--
}

