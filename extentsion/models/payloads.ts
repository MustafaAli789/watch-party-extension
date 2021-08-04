import { Room } from "../../sharedmodels/room";

//Payloads used in frontend only
export interface ExtensionNewRoomPayload {
    userName: string,
    roomName: string
}
export interface ExtensionRoomPayload {
    room: Room
}

export interface ExtensionJoinRoomPayload {
    userName: string,
    roomId: string
}

