import { RoomAction, UserChange, VideoEvent } from './constants';
import { Room } from './room'
import { User } from './user';
import { VideoData } from './videoData'

export interface SocketJoinRoomPayload {
    roomName?: string,
    userName: string,
    roomId: string,
    action: RoomAction
}

export interface SocketRoomDataPayload {
    room: Room
}

export interface SocketUserChangePayload {
    changeEvent: UserChange,
    changedUser: User
}

export interface SocketCreateVideoEventPayload {
    videoEvent: VideoEvent,
    videoData: VideoData,
    triggeringUserId: string,
    userIdToSendTo?: string, //if specified, will send event to a specific user only,
    error?: string
}

export interface SocketGetVideoEventPayload {
    videoEvent: VideoEvent,
    videoData: VideoData,
    triggeringUser: User,
    error?: string
}

export interface SocketSyncVideoPayload {
    userId: string,
    userJoining: Boolean
}
