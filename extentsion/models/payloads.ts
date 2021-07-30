import { User } from "../../sharedmodels/user";


//Payloads
export interface NewRoomPayload {
    userName: string,
    roomName: string
}
export interface SocketRoomCreatedPayload {
    users: Array<User>,
    roomId: string
}

