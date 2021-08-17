import { RoomAction, UserChange, VideoEvent } from './constants';
import { Room } from './room'
import { User } from './user';
import { VideoData } from './videoData'

export interface ToServerJoinRoomPayload {
    roomName?: string,
    userName: string,
    roomId: string,
    action: RoomAction
}

export interface ToExtRoomDataPayload {
    room: Room
}

export interface ToExtUserChangePayload {
    userChangeEvent: UserChange,
    changedUser: User
}

export interface ToServerVideoEventPayload {
    videoEvent: VideoEvent,
    videoData: VideoData,
    triggeringUser: User,
    userIdToSendTo?: string, //if specified, will send event to a specific user only,
    error?: string
}

export interface ToExtVideoEventPayload {
    videoEvent: VideoEvent,
    videoData: VideoData,
    triggeringUser: User,
    error?: string
}

export interface ToExtSyncVideoPayload {
    userRequestingSync: User,
    userJoining: Boolean
}

export interface ToServerOffsetTimePayload {
    offsetTime: number
}
