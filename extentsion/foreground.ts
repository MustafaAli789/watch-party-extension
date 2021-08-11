import { Messages } from './models/constants'
import { ToFgJoinRoomPayload, ToFgNewRoomPayload, ToPopupRoomPayload } from './models/payloads';
import { MessageObject, ResponseObject,  } from './models/messagepassing';

import { SocketEvents, RoomAction, UserChange, VideoEvent } from '../sharedmodels/constants'
import {  ToServerJoinRoomPayload, ToExtRoomDataPayload, ToExtUserChangePayload, ToServerVideoEventPayload, ToExtVideoEventPayload, ToExtSyncVideoPayload } from '../sharedmodels/payloads'
import { VideoData } from '../sharedmodels/videoData';

import { Socket, io } from 'socket.io-client'; 
import { Room } from '../sharedmodels/room';
import { User } from '../sharedmodels/user';
import { Message } from '../sharedmodels/message';

var vidElem: HTMLVideoElement = document.querySelector('video')
var socket: Socket
var socketVideoEventHappened = {
    play: false,
    pause: false,
    seek: false,
    speed: false
}
var currentRoom: Room = null
var chatOpen: Boolean = true

// Notif Container
var notifContainer = document.createElement('DIV')
notifContainer.id = "notifContainer"
notifContainer.classList.add('toast-container', 'position-fixed', 'bottom-0', 'end-0', 'p-3')
document.querySelector('body').appendChild(notifContainer)
var notifCount = 0

// Chat Container
var chatContainer = document.createElement('DIV')
chatContainer.id = "chatContainer"
document.querySelector('body').appendChild(chatContainer)

var isSeeking = false;
var seekedTimeout;
var SEEKEVENT_TIMEOUT = 50;

const getCurUser = (room: Room): User => {
    return room.users.find(user => user.current)
}

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

const establishSocketConnectionForNewRoom = (newRoomData: ToFgNewRoomPayload, sendResponse) => {
    //theoretically should be unique
    let roomId: string = guid()
    let roomData: ToServerJoinRoomPayload = {roomName: newRoomData.roomName, userName: newRoomData.userName, roomId: roomId, action: RoomAction.CREATE}
    createSocketConnection(roomData, sendResponse)
}

const establishSocketConnectionForExistingRoom = (joinRoomData: ToFgJoinRoomPayload, sendResponse) => {
    let roomData: ToServerJoinRoomPayload = {roomName: null, userName: joinRoomData.userName, roomId: joinRoomData.roomId, action: RoomAction.JOIN}
    createSocketConnection(roomData, sendResponse)
}

const createSocketConnection = (roomData: ToServerJoinRoomPayload, sendResponse) => {

    vidElem.onplay = function() {
        if (socketVideoEventHappened.play) {
            socketVideoEventHappened.play = false
            return
        }
        if (!isSeeking) {
            socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
                videoEvent: VideoEvent.PLAY, 
                videoData: retrieveVideoData(), 
                triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
        } else {
            let videoData = retrieveVideoData()
            videoData.playing = true //dont know why it isnt ready state isnt > 2 here but oh well, we'll just say its playing manually

            // case: when vid is playing and someone seeks vid by dragging or clicking some time
            socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
                videoEvent: VideoEvent.SEEK, 
                videoData: videoData, 
                triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
        }
    }
    vidElem.onpause = function() {
        if (socketVideoEventHappened.pause) {
            socketVideoEventHappened.pause = false
            return
        }
        seekedTimeout = setTimeout(() => {
            socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
                videoEvent: VideoEvent.PAUSE, 
                videoData: retrieveVideoData(), 
                triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
        }, SEEKEVENT_TIMEOUT)
    }

    // when u seek either by dragging current point or clicking somewhere in time it goes pause --> seeking --> play --> seeked
    // insp from: https://stackoverflow.com/questions/61698738/html5-video-calls-onpause-and-onplay-event-when-seeking
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
            socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
                videoEvent: VideoEvent.SEEK, 
                videoData: retrieveVideoData(), 
                triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
        }
    }
    vidElem.onratechange = function() {
        if (socketVideoEventHappened.speed) {
            socketVideoEventHappened.speed = false
            return
        }
        socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
            videoEvent: VideoEvent.SPEED, 
            videoData: retrieveVideoData(), 
            triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
    }

    //https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
    socket = io('http://localhost:3000',{ transports: ['websocket', 'polling', 'flashsocket'] });

    socket.emit(SocketEvents.TO_SERVER_JOIN, roomData, (err) => {
        socket.emit(SocketEvents.TO_SERVER_FORCE_DISCONNECT)
        addNotif({ headerMsg: 'Join Error', bodyMsg: err, type: 'ERROR' })
    })

    socket.on(SocketEvents.TO_EXT_ROOM_DATA, (data: ToExtRoomDataPayload) => {
        data.room.users.find(user => user.userId === socket.id).current = true
        if (currentRoom === null) {
            sendResponse({
                status: Messages.SUCCESS,
                payload: {room: data.room, chatOpen: chatOpen}
            } as ResponseObject<ToPopupRoomPayload>)
            createChatComponent()
            updateChat(data.room.messages)
        } else if(currentRoom.users !== data.room.users) {
            chrome.runtime.sendMessage({
                message: Messages.TOPOPUP_ROOM_DATA,
                payload: {room: data.room}
            } as MessageObject<ToPopupRoomPayload>)
        } else if (currentRoom.messages !== data.room.messages) {
            updateChat(data.room.messages)
        }
        currentRoom = data.room
    })

    socket.on(SocketEvents.TO_EXT_USER_CHANGE, (data: ToExtUserChangePayload) => {
        if (data.userChangeEvent === UserChange.JOIN) {
            addNotif({ headerMsg: 'User Joined', type: 'SPECIAL', bodyMsg:  `User ${data.changedUser.userName} joined room.` })
        } else if (data.userChangeEvent === UserChange.DISCONNECT) {
            addNotif({ headerMsg: 'User Left', type: 'SPECIAL', bodyMsg:  `User ${data.changedUser.userName} left room.` })
        }
    })

    //THEORETICALLY ONLY ADMIN SHOULD RECIEVE THIS
    socket.on(SocketEvents.TO_SERVER_TO_EXT_SYNC_VIDEO, (data: ToExtSyncVideoPayload) => {
        let errMsg
        if (data.userRequestingSync.admin) {
            errMsg = 'User being synced to is buffering. Please retry.'
        } else {
            errMsg = 'Admins video is buffering. Please retry.'
        }
        socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
            videoEvent: data.userJoining ? VideoEvent.JOIN : VideoEvent.SYNC, 
            videoData: retrieveVideoData(), 
            userIdToSendTo: data.userRequestingSync.userId,
            triggeringUser: getCurUser(currentRoom),
            error: vidElem.readyState <= 2 ? errMsg : null } as ToServerVideoEventPayload)
    })

    socket.on(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, (videoEventData: ToExtVideoEventPayload) => {
        let elapsedTimeSinceRequestSec = (Date.now() - videoEventData.videoData.timestamp)/1000
        switch(videoEventData.videoEvent) {
            case(VideoEvent.SYNC):
            case(VideoEvent.JOIN):
                if(!!videoEventData.error) { // i.e admin is currently buffering
                    if (videoEventData.videoEvent === VideoEvent.JOIN) {
                        socket.emit(SocketEvents.TO_SERVER_FORCE_DISCONNECT)
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
                
                // https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
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

chrome.runtime.onMessage.addListener((request: MessageObject<any>, sender, sendResponse) => {
    if (request.message === Messages.TOFG_VIDEO_ON_SCREEN) {
        vidElem = document.querySelector('video')
        if (vidElem?.offsetParent != null && vidElem?.offsetParent != undefined) { //to ensure video is actually visible
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
        establishSocketConnectionForNewRoom(<ToFgNewRoomPayload>request.payload, sendResponse)
        return true
    } else if(request.message === Messages.TOFG_JOIN_ROOM_IN_TAB) {
        establishSocketConnectionForExistingRoom(<ToFgJoinRoomPayload>request.payload, sendResponse)
        return true
    } else if (request.message === Messages.TOFG_DISCONNECT) {
        currentRoom = null
        chatOpen = true
        socket.emit(SocketEvents.TO_SERVER_FORCE_DISCONNECT)
        sendResponse({
            status: Messages.SUCCESS
        } as ResponseObject<null>)
    } else if (request.message === Messages.TOFG_RETRIEVE_ROOM_DATA) {
        sendResponse({
            status: Messages.SUCCESS,
            payload: {room: currentRoom, chatOpen: chatOpen}
        } as ResponseObject<ToPopupRoomPayload>)
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
        socket.emit(SocketEvents.TO_SERVER_TO_EXT_SYNC_VIDEO, {}, (err) => {
            addNotif({ headerMsg: 'Sync Error', bodyMsg: err, type: 'ERROR' })
        })
        return true
    } else if (request.message === Messages.TOFG_CHAT_TOGGLE) {
        chatOpen = request.payload
        if (request.payload) {
            chatContainer.classList.remove('removeFromView')
        } else {
            chatContainer.classList.add('removeFromView')
        }
    }
});

const addNotif = (data: { headerMsg: string, bodyMsg: string, type: 'ERROR' | 'NOTIF' | 'SUCCESS' | 'SPECIAL' }) => {
    notifCount++
    let toast = document.createElement('DIV');
    toast.id = `toast${notifCount}`

    let color = data.type === 'ERROR' ? 'red' : (data.type === 'NOTIF' ? 'blue' : (data.type === 'SPECIAL' ? 'purple' : 'green'))
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

// inspo https://stackoverflow.com/questions/21426056/horizontal-sliding-panel-with-relative-postion-handle-show-hide-jquery
const createChatComponent = () => {
    chatContainer.innerHTML = `<div class="panel">
        <div>
        <h1>Heading</h1>
        </div>
        <div>
            <p>Body data</p>
        </div>
    </div>
    <a href="javascript:void(0);" class="slider-arrow show">&laquo;</a>`

    let sliderArrow = document.querySelector(".slider-arrow")
    sliderArrow.addEventListener('click', () => {
        if (sliderArrow.classList.contains('show')) {
            (<HTMLDivElement>document.querySelector(".panel")).style.right = "0px";
            (<HTMLAnchorElement>document.querySelector(".slider-arrow")).style.right = "300px";
            sliderArrow.innerHTML = '&raquo;'
            sliderArrow.classList.remove('show')
            sliderArrow.classList.add('hide')
        } else {
            (<HTMLDivElement>document.querySelector(".panel")).style.right = "-300px";
            (<HTMLAnchorElement>document.querySelector(".slider-arrow")).style.right = "0px";
            sliderArrow.innerHTML = '&laquo;'
            sliderArrow.classList.remove('hide')
            sliderArrow.classList.add('show')
        }
    })
}

const updateChat = (messages: Message[]) => {
    // update chat here
}



