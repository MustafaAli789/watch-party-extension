import { User } from "./user";
import { Message } from './message'

export interface Room {
    roomId: string;
    roomName: string;
    users: User[];
    messages: Message[];
    addUser: (user: User) => void;
    removeUserFromRoom: (userId: string) => User;
}