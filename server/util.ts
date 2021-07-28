export class User {
    userId: String;
    userName: String;
    roomId: String;
    constructor(userId: String, userName: String, roomId:String) {
        this.userId = userId;
        this.userName = userName;
        this.roomId = roomId;
    }
    
}   

export class Room {
    roomId: String;
    roomName: String;
    users: User[] = [];
    constructor(roomId: String, roomName: String) {
        this.roomId = roomId;
        this.roomName = roomName
    }

    addUser = (user: User): void => {
        this.users.push(user)
    }
    removeUserFromRoom = (userId: String): User => {
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
}

const rooms: Array<Room> = []

export const addRoom = (roomId: String, roomName: String): void => {
    rooms.push(new Room(roomId, roomName))
}

export const addUserToRoom = (userId: String, userName:String, roomId: String): {error: String, user: User} => {
    let uName: String = userName.trim().toLowerCase();

    const existingRoom: Room = rooms.find(room => room.roomId == roomId)

    if (!existingRoom) {
        return {error:  `Room with id ${roomId} does not exist.`, user: null}
    }

    const user: User = new User(userId, uName, roomId)
    existingRoom.addUser(user)

    return { user, error: null }
}

export const removeUser = (userId: String): { deletedUser: User, error: String } => {
    let deletedUser: User
    for (let i =0; i<rooms.length; i++) {
        deletedUser = rooms[i].removeUserFromRoom(userId)
        if(deletedUser != null) {

            //special check to see if room empty i.e last person in room left
            if (rooms[i].users.length == 0) {
                rooms.splice(i, 1)
            }

            return { deletedUser, error: null }
        }
    }

    return {error: `User with id ${userId} does not exist`, deletedUser: null}
}

export const getUsersInRoom = (roomId: String): Array<User> => {
    for (let i =0; i<rooms.length; i++) {
        let room: Room = rooms[i];
        if (room.roomId == roomId) {
            return room.users
        }
    }
    return []
}

//module.exports={ addRoom, removeUser, addUserToRoom, getUsersInRoom }