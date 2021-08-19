import { Messages } from './models/constants'
import { ToFgJoinRoomPayload, ToFgNewRoomPayload, ToFgOffsetPayload, ToPopupRoomPayload } from './models/payloads';
import { MessageObject, ResponseObject,  } from './models/messagepassing';
import { NotifDataInterface, NotifActionButtonInterface } from "./models/Miscellaneous"

import { SocketEvents, RoomAction, UserChange, VideoEvent } from '../sharedmodels/constants'
import {  ToServerJoinRoomPayload, ToExtRoomDataPayload, ToExtUserChangePayload, ToServerVideoEventPayload, ToExtVideoEventPayload, ToExtSyncVideoPayload, ToServerOffsetTimePayload } from '../sharedmodels/payloads'
import { VideoData } from '../sharedmodels/videoData';

import { Socket, io } from 'socket.io-client'; 
import { Room } from '../sharedmodels/room';
import { User } from '../sharedmodels/user';
import { Message } from '../sharedmodels/message';

import { addNotif, createChatComponent, deleteChatComponent, updateChat, toggleChatComponentContainerInView  } from './foregroundUi'

var vidElem: HTMLVideoElement = document.querySelector('video')
var socket: Socket
var algorithmicVideoEventHappened = {
    play: false,
    pause: false,
    seek: false,
    seeking: false,
    speed: false
}
var currentRoom: Room = null
var chatOpen: Boolean = false

var isSeeking = false;
var seekedTimeout;
var SEEKEVENT_TIMEOUT = 50;

const getCurUser = (room: Room): User => {
    return room.users.find(user => user.current)
}
const getHourAndMinFormatted = (): string => {
    let curDate: Date = new Date()
    return `${curDate.getHours()}:${curDate.getMinutes()}:${curDate.getSeconds()}`
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

    vidElem.loop = false
    vidElem.autoplay = false
    vidElem.fastSeek

    vidElem.onplay = function() {
        if (algorithmicVideoEventHappened.play) {
            algorithmicVideoEventHappened.play = false
            return
        }
        if (!isSeeking) {
            socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
                videoEvent: VideoEvent.PLAY, 
                videoData: retrieveVideoData(), 
                triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
        }
    }
    vidElem.onpause = function() {
        if (algorithmicVideoEventHappened.pause) {
            algorithmicVideoEventHappened.pause = false
            return
        }
        //if this guys at the end of a vid, we dont want the auto pause to trigger
        if (vidElem.currentTime === vidElem.duration) {
            return
        }
        seekedTimeout = setTimeout(() => {
            socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
                videoEvent: VideoEvent.PAUSE, 
                videoData: retrieveVideoData(), 
                triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
        }, SEEKEVENT_TIMEOUT)
    }

    // when u seek either by dragging current point or clicking somewhere in time it goes pause --> seeking --> play --> seeked on YOUTUBE but other place had seeing --> seeked only smhh
    // insp from: https://stackoverflow.com/questions/61698738/html5-video-calls-onpause-and-onplay-event-when-seeking
    vidElem.onseeking = function() {
        if (algorithmicVideoEventHappened.seeking) {
            algorithmicVideoEventHappened.seeking = false
            return
        }
        clearTimeout(seekedTimeout)
        isSeeking = true
    }
    vidElem.onseeked = function() {
        isSeeking = false
        if (algorithmicVideoEventHappened.seek) {
            algorithmicVideoEventHappened.seek = false
            return
        }
        
        //case: when vid is paused and someone seeks vid by dragging or clicking some time
        // case: when vid is playing and someone seeks vid by dragging or clicking some time
        socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
            videoEvent: VideoEvent.SEEK, 
            videoData: retrieveVideoData(), 
            triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
    }
    vidElem.onratechange = function() {
        if (algorithmicVideoEventHappened.speed) {
            algorithmicVideoEventHappened.speed = false
            return
        }
        socket.emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { 
            videoEvent: VideoEvent.SPEED, 
            videoData: retrieveVideoData(), 
            triggeringUser: getCurUser(currentRoom) } as ToServerVideoEventPayload)
    }

    //https://stackoverflow.com/questions/44628363/socket-io-access-control-allow-origin-error
    socket = io('https://ec2-18-190-156-173.us-east-2.compute.amazonaws.com',{ transports: ['websocket', 'polling', 'flashsocket'] });

    socket.emit(SocketEvents.TO_SERVER_JOIN, roomData, (err) => {
        socket.emit(SocketEvents.TO_SERVER_FORCE_DISCONNECT)
        addNotif({ headerMsg: 'Join Error', bodyMsg: err, type: 'ERROR' })
    })

    socket.on(SocketEvents.TO_EXT_ROOM_DATA, (data: ToExtRoomDataPayload) => {
        data.room.users.find(user => user.userId === socket.id).current = true
        if (currentRoom === null) { // initial room join
            chatOpen = true
            currentRoom = data.room

            sendResponse({
                status: Messages.SUCCESS,
                payload: {room: currentRoom, chatOpen: chatOpen, videoLength: vidElem.duration, offsetTime: 0}
            } as ResponseObject<ToPopupRoomPayload>)

            toggleChatComponentContainerInView(true)
            createChatComponent(currentRoom.roomName, socket, getCurUser(currentRoom))

            let initWelcomeMsg: Message = { user: null, type: "MSG", content: `${getCurUser(currentRoom).userName}, welcome to room ${currentRoom.roomName}`, timestamp: getHourAndMinFormatted() }

            updateChat([...currentRoom.messages,initWelcomeMsg], getCurUser(currentRoom))
        } else if(currentRoom.users !== data.room.users) {
            //if u are now the room admin but before werent
            if (data.room.users.find(user => user.admin)?.current && !currentRoom.users.find(user => user.admin)?.current) {
                addNotif({ headerMsg: 'Admin Assignment', bodyMsg: "You are now the new room admin.", type: 'SPECIAL' })
            }

            currentRoom = data.room

            chrome.runtime.sendMessage({
                message: Messages.TOPOPUP_ROOM_DATA,
                payload: {room: currentRoom, videoLength: vidElem.duration, offsetTime: getCurUser(currentRoom).offsetTime}
            } as MessageObject<ToPopupRoomPayload>)
        }
    })

    socket.on(SocketEvents.TO_EXT_USER_CHANGE, (data: ToExtUserChangePayload) => {
        let userChangeMsgContent: string
        if (data.userChangeEvent === UserChange.JOIN) {
            userChangeMsgContent = `${data.changedUser.userName} joined the room`
            addNotif({ headerMsg: 'User Joined', type: 'SPECIAL', bodyMsg:  `User ${data.changedUser.userName} joined room.` })
        } else if (data.userChangeEvent === UserChange.DISCONNECT) {
            userChangeMsgContent = `${data.changedUser.userName} left the room`
            addNotif({ headerMsg: 'User Left', type: 'SPECIAL', bodyMsg:  `User ${data.changedUser.userName} left room.` })
        }

        let userChangeMsg: Message = { user: null, type: "MSG", content: userChangeMsgContent, timestamp: getHourAndMinFormatted() }
        updateChat([userChangeMsg], getCurUser(currentRoom))
    })

    socket.on(SocketEvents.TO_SERVER_TO_EXT_CHAT, (msg: Message) => {
        updateChat([msg], getCurUser(currentRoom))
    })

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
        let newVidTime
        switch(videoEventData.videoEvent) {
            case(VideoEvent.SYNC):
            case(VideoEvent.JOIN):
                //ex: name in use or user being synces to is buffering
                if(!!videoEventData.error) { 
                    if (videoEventData.videoEvent === VideoEvent.JOIN) {
                        socket.emit(SocketEvents.TO_SERVER_FORCE_DISCONNECT)
                    }
                    addNotif({ headerMsg: 'Error', type: 'ERROR', bodyMsg: videoEventData.error })
                    return
                }
                algorithmicVideoEventHappened.seek = true

                //need to account for differences in offsets
                newVidTime = videoEventData.videoData.playbackTime + (getCurUser(currentRoom).offsetTime - videoEventData.triggeringUser.offsetTime)

                //if video was playing and someone seeks, then account for that little time it takes to recieve req and their vid playing during that time
                if (!vidElem.paused) {
                    newVidTime += elapsedTimeSinceRequestSec*vidElem.playbackRate
                }

                vidElem.currentTime = newVidTime
                
                if (videoEventData.videoData.playing && vidElem.paused) {
                    algorithmicVideoEventHappened.play = true
                    vidElem.play()
                } else if(!videoEventData.videoData.playing && !vidElem.paused) {
                    algorithmicVideoEventHappened.pause = true
                    vidElem.pause()
                }

                if (vidElem.playbackRate !== videoEventData.videoData.speed) {
                    algorithmicVideoEventHappened.speed = true
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
                addNotif({ headerMsg: 'Play Video', type: 'NOTIF', bodyMsg:  `User ${videoEventData.triggeringUser.userName} played video.` })

                //if ths guy recieves a play from someone while at end of video, we dont want to accidentaly restart video and send seek event 
                if (vidElem.currentTime === vidElem.duration) {
                    return
                }
                algorithmicVideoEventHappened.play = true
                vidElem.play()
                break;
            case(VideoEvent.PAUSE):
                algorithmicVideoEventHappened.pause = true
                vidElem.pause()
                addNotif({ headerMsg: 'Pause Video', type: 'NOTIF', bodyMsg:  `User ${videoEventData.triggeringUser.userName} paused video.` })
                break;
            case(VideoEvent.SPEED):
                algorithmicVideoEventHappened.speed = true
                vidElem.playbackRate = videoEventData.videoData.speed
                addNotif({ headerMsg: 'Change Video Speed', type: 'NOTIF', bodyMsg:  `User ${videoEventData.triggeringUser.userName} changed video speed to ${videoEventData.videoData.speed}.` })
                break;
            case(VideoEvent.SEEK):
                algorithmicVideoEventHappened.seek = true

                //need to account for differences in offsets
                newVidTime = videoEventData.videoData.playbackTime + (getCurUser(currentRoom).offsetTime - videoEventData.triggeringUser.offsetTime)

                //if video was playing and someone seeks, then account for that little time it takes to recieve req and their vid playing during that time
                if (!vidElem.paused) {
                    newVidTime += elapsedTimeSinceRequestSec*vidElem.playbackRate
                }

                vidElem.currentTime = newVidTime
                
                // https://stackoverflow.com/questions/1322732/convert-seconds-to-hh-mm-ss-with-javascript
                let timeSeekedReadable = new Date(newVidTime * 1000).toISOString().substr(11, 8)
                if (videoEventData.videoData.playing && vidElem.paused) {
                    algorithmicVideoEventHappened.play = true
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
            
            let actionButtonData: NotifActionButtonInterface = null
            let toastBodyData: NotifDataInterface = { headerMsg: 'Video Missing Error', bodyMsg: "There must be a video on screen to create or join a room", type: 'ERROR' }
            if (document.querySelector('iframe')) {
                actionButtonData = { buttonContent: "Visit Video Source", buttonAction: () => {
                    chrome.runtime.sendMessage({
                        message: Messages.TOBG_OPEN_TAB_WITH_URL,
                        payload: document.querySelector('iframe').src
                    } as MessageObject<string>)
                }}
            }
            addNotif(toastBodyData, actionButtonData)
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
        chatOpen = false
        deleteChatComponent()
        socket.emit(SocketEvents.TO_SERVER_FORCE_DISCONNECT)
        sendResponse({
            status: Messages.SUCCESS
        } as ResponseObject<null>)
    } else if (request.message === Messages.TOFG_RETRIEVE_ROOM_DATA) {
        sendResponse({
            status: Messages.SUCCESS,
            payload: {room: currentRoom, chatOpen: chatOpen, videoLength: vidElem.duration, offsetTime: getCurUser(currentRoom).offsetTime}
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
        toggleChatComponentContainerInView(request.payload)
    } else if (request.message === Messages.TOFG_SET_OFFSET) {
        let payload = <ToFgOffsetPayload>request.payload
        let oldOffsetTime = getCurUser(currentRoom).offsetTime

        let newOffsetTime = payload.offsetTime*(payload.direction === "DOWN" ? -1 : 1)
        let newOffsetTimeFormatted = new Date(newOffsetTime * 1000).toISOString().substr(11, 8)
        getCurUser(currentRoom).offsetTime = newOffsetTime

        socket.emit(SocketEvents.TO_SERVER_SET_OFFSET, { offsetTime: newOffsetTime } as ToServerOffsetTimePayload)
        addNotif({ headerMsg: 'Offset Time Set', bodyMsg: "Successfully set offset time to " + newOffsetTimeFormatted, type: 'SUCCESS' })

        algorithmicVideoEventHappened.seek = true
        vidElem.currentTime = vidElem.currentTime+newOffsetTime-oldOffsetTime //need the -oldOffsetTime to make sure it resets to normal sync with admin

        return true
    }
});


