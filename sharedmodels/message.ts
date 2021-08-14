import { User } from './user'

export interface Message {
    user: User,
    content: string,
    timestamp: string,
    pingedUserId?: string,
    type: "IMG"| "MSG"
}