import { User } from "./user";

export interface Room {
    roomId: string;
    roomName: string;
    users: User[];
    addUser: (user: User) => void;
    removeUserFromRoom: (userId: string) => User;
}