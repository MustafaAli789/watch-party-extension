"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminUserFromRoom = exports.getUserFromId = exports.getRoomFromUserId = exports.getRoom = exports.removeUser = exports.addUserToRoom = exports.addRoom = exports.RoomImpl = exports.UserImpl = void 0;
class UserImpl {
    constructor(userId, userName, roomId, admin) {
        this.userId = userId;
        this.userName = userName;
        this.roomId = roomId;
        this.admin = admin;
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
        this.getCurrentUser = () => {
            return this.users.find(user => user.current);
        };
        this.getAdminUser = () => {
            return this.users.find(user => user.admin);
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
const addUserToRoom = (userId, userName, roomId, admin) => {
    let uName = userName.trim().toLowerCase();
    const existingRoom = rooms.find(room => room.roomId == roomId);
    if (!existingRoom) {
        return { error: `Room with id ${roomId} does not exist.`, user: null };
    }
    if (existingRoom.users.find(user => user.userName.trim() === userName.trim())) {
        return { error: `User with username ${userName.trim()} already exists in room.`, user: null };
    }
    const user = new UserImpl(userId, uName, roomId, admin);
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
            //else reassign admin status
            if (rooms[i].users.length == 0) {
                rooms.splice(i, 1);
            }
            else if (deletedUser.admin) {
                rooms[i].users[Math.floor(Math.random() * rooms[i].users.length)].admin = true;
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
const getUserFromId = (userId) => {
    for (let i = rooms.length - 1; i >= 0; i--) {
        let user = rooms[i].users.find(user => user.userId === userId);
        if (!!user) {
            return user;
        }
    }
    return null;
};
exports.getUserFromId = getUserFromId;
const getAdminUserFromRoom = (roomId) => {
    var _a;
    let user = (_a = rooms.find(room => room.roomId === roomId)) === null || _a === void 0 ? void 0 : _a.users.find(user => user.admin);
    return user;
};
exports.getAdminUserFromRoom = getAdminUserFromRoom;
//# sourceMappingURL=util.js.map