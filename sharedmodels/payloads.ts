import { RoomAction } from './constants';
import { Room } from './room'

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
    message: string
}