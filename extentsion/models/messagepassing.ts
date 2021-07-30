import { Messages } from "./constants";

//Main message passing involved objects
export interface MessageObject<T> {
    message: Messages,
    payload: T
}
export interface ResponseObject<T> {
    status: Messages.SUCCESS | Messages.FAILURE,
    payload: T
}