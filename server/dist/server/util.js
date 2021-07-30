"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomFromUserId = exports.getRoom = exports.removeUser = exports.addUserToRoom = exports.addRoom = exports.RoomImpl = exports.UserImpl = void 0;
class UserImpl {
    constructor(userId, userName, roomId) {
        this.userId = userId;
        this.userName = userName;
        this.roomId = roomId;
    }
}
exports.UserImpl = UserImpl;
class RoomImpl {
    constructor(roomId, roomName) {
        this.users = [];
        this.addUser = (user) => {
            this.users.push(user);
        };
        this.removeUserFromRoom = (userId) => {
            let userToDel;
            let indToDel = this.users.map(user => user.userId).indexOf(userId);
            if (indToDel != null && indToDel != undefined) {
                userToDel = this.users[indToDel];
                this.users.splice(indToDel, 1);
                return userToDel;
            }
            else {
                return null;
            }
        };
        this.roomId = roomId;
        this.roomName = roomName;
    }
}
exports.RoomImpl = RoomImpl;
const rooms = [];
const addRoom = (roomId, roomName) => {
    rooms.push(new RoomImpl(roomId, roomName));
};
exports.addRoom = addRoom;
const addUserToRoom = (userId, userName, roomId) => {
    let uName = userName.trim().toLowerCase();
    const existingRoom = rooms.find(room => room.roomId == roomId);
    if (!existingRoom) {
        return { error: `Room with id ${roomId} does not exist.`, user: null };
    }
    const user = new UserImpl(userId, uName, roomId);
    existingRoom.addUser(user);
    return { user, error: null };
};
exports.addUserToRoom = addUserToRoom;
const removeUser = (userId) => {
    let deletedUser;
    for (let i = rooms.length - 1; i >= 0; i--) {
        deletedUser = rooms[i].removeUserFromRoom(userId);
        if (deletedUser != null && deletedUser != undefined) {
            //special check to see if room empty i.e last person in room left
            if (rooms[i].users.length == 0) {
                rooms.splice(i, 1);
            }
            return { deletedUser, error: null };
        }
    }
    return { error: `User with id ${userId} does not exist`, deletedUser: null };
};
exports.removeUser = removeUser;
const getRoom = (roomId) => {
    return rooms.find(room => room.roomId === roomId);
};
exports.getRoom = getRoom;
const getRoomFromUserId = (userId) => {
    return rooms.find(room => room.users.find(user => user.userId === userId));
};
exports.getRoomFromUserId = getRoomFromUserId;
//# sourceMappingURL=util.js.map