import { Room } from "../../sharedmodels/room";

//Payloads used in frontend only
export interface ToFgNewRoomPayload {
    userName: string,
    roomName: string
}
export interface ToPopupRoomPayload {
    room: Room
}

export interface ToFgJoinRoomPayload {
    userName: string,
    roomId: string
}