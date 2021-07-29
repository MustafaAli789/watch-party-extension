import { Messages, Page } from "./constants";

export interface PageMetadata {
    roomName: string,
    roomId: string | null,
    pageType: Page
}

export interface User {
    userName: string,
    userId: string,
    roomId: string
}

export interface Tab {
    channelOpen: boolean,
    active: boolean,
    id: number
}

export interface Tabs {
    tabs: Array<Tab>
}

//Payloads
export interface NewRoomPayload {
    userName: string,
    roomName: string
}
export interface SocketRoomCreatedPayload {
    users: Array<User>,
    roomId: string
}

//Main Data objects
export interface MessageObject<T> {
    message: Messages,
    payload: T
}
export interface ResponseObject<T> {
    status: Messages.SUCCESS | Messages.FAILURE,
    payload: T
}
