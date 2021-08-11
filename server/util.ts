import { Message } from '../sharedmodels/message';
import { Room } from '../sharedmodels/room'
import { User } from '../sharedmodels/user'

export class UserImpl implements User {
    userId: string;
    userName: string;
    roomId: string;
    admin: Boolean;
    current?: Boolean;
    constructor(userId: string, userName: string, roomId: string, admin: Boolean) {
        this.userId = userId;
        this.userName = userName;
        this.roomId = roomId;
        this.admin = admin;
    }
    
}   

export class RoomImpl implements Room {
    roomId: string;
    roomName: string;
    users: User[] = [];
    messages: Message[] = []
    constructor(roomId: string, roomName: string) {
        this.roomId = roomId;
        this.roomName = roomName
    }

    addUser = (user: User): void => {
        this.users.push(user)
    }
    removeUserFromRoom = (userId: string): User => {
        let userToDel: User;
        let indToDel: number = this.users.map(user => user.userId).indexOf(userId)
        if (indToDel != null && indToDel != undefined) {
            userToDel = this.users[indToDel]
            this.users.splice(indToDel, 1)
            return userToDel
        } else {
            return null
        }
    }
    getCurrentUser = () => {
        return this.users.find(user => user.current)
    }
    getAdminUser = () => {
        return this.users.find(user => user.admin)
    }
}

const rooms: Array<Room> = []

export const addRoom = (roomId: string, roomName: string): void => {
    rooms.push(new RoomImpl(roomId, roomName))
}

export const addUserToRoom = (userId: string, userName: string, roomId: string, admin: Boolean): {error: string, user: User} => {
    let uName: string = userName.trim().toLowerCase();

    const existingRoom: Room = rooms.find(room => room.roomId == roomId)

    if (!existingRoom) {
        return {error:  `Room with id ${roomId} does not exist.`, user: null}
    }
    if (existingRoom.users.find(user => user.userName.trim() === userName.trim())) {
        return {error:  `User with username ${userName.trim()} already exists in room.`, user: null}
    }

    const user: User = new UserImpl(userId, uName, roomId, admin)
    existingRoom.addUser(user)

    return { user, error: null }
}

export const removeUser = (userId: string): { deletedUser: User, error: String } => {
    let deletedUser: User
    for (let i =rooms.length-1; i>=0; i--) {
        deletedUser = rooms[i].removeUserFromRoom(userId)
        if(deletedUser != null && deletedUser != undefined) {

            //special check to see if room empty i.e last person in room left
            //else reassign admin status
            if (rooms[i].users.length == 0) {
                rooms.splice(i, 1)
            } else if(deletedUser.admin) { 
                rooms[i].users[Math.floor(Math.random() * rooms[i].users.length)].admin = true
            }

            return { deletedUser, error: null }
        }
    }

    return {error: `User with id ${userId} does not exist`, deletedUser: null}
}

export const getRoom = (roomId: string): Room => {
    return rooms.find(room => room.roomId === roomId)
}

export const getRoomFromUserId = (userId: string): Room => {
    return rooms.find(room => room.users.find(user => user.userId === userId))
}

export const getUserFromId = (userId: string): User => {
    for (let i =rooms.length-1; i>=0; i--) {
        let user = rooms[i].users.find(user => user.userId === userId)
        if (!!user){
            return user
        }
    }
    return null
}

export const getAdminUserFromRoom = (roomId: string): User => {
    let user = rooms.find(room => room.roomId === roomId)?.users.find(user => user.admin)
    return user
}

