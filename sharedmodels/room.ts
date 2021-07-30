import { User } from "./user";

export interface Room {
    roomId: String;
    roomName: String;
    users: User[];
    addUser: (user: User) => void;
    removeUserFromRoom: (userId: string) => User;

}