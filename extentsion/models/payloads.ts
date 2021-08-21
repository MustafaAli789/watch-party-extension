import { Room } from "../../sharedmodels/room";

//Payloads used in frontend only
export interface ToFgNewRoomPayload {
    userName: string,
    roomName: string
}
export interface ToPopupRoomPayload {
    room: Room,
    chatOpen: Boolean,
    videoLength: number,
    offsetTime: number
}

export interface ToFgJoinRoomPayload {
    userName: string,
    roomId: string
}

export interface ToFgOffsetPayload {
    offsetTime: number,
    direction: "UP" | "DOWN"
}

export interface ToPopupAdminTimeInfoPayload {
    curTime: number,
    vidDuration: number,
    vidPaused: Boolean,
    vidBuffering: Boolean
}