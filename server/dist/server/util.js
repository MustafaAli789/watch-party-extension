"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminUserFromRoom = exports.getUserFromId = exports.getRoomFromUserId = exports.getRoom = exports.removeUser = exports.addUserToRoom = exports.addRoom = exports.RoomImpl = exports.UserImpl = void 0;
// https://stackoverflow.com/questions/1484506/random-color-generator
function get_random_color() {
    function c() {
        var hex = Math.floor(Math.random() * 256).toString(16);
        return ("0" + String(hex)).substr(-2); // pad with zero
    }
    return "#" + c() + c() + c();
}
class UserImpl {
    constructor(userId, userName, roomId, admin, offsetTime) {
        this.color = get_random_color();
        this.userId = userId;
        this.userName = userName;
        this.roomId = roomId;
        this.admin = admin;
        this.offsetTime = offsetTime;
    }
}
exports.UserImpl = UserImpl;
class RoomImpl {
    constructor(roomId, roomName) {
        this.users = [];
        this.messages = [];
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
    let uName = userName.trim().toLowerCase().replace(/ /g, "_");
    const existingRoom = rooms.find(room => room.roomId == roomId);
    if (!existingRoom) {
        return { error: `Room with id ${roomId} does not exist.`, user: null };
    }
    if (uName === "" || uName === null) {
        return { error: "Username cannot be empty", user: null };
    }
    if (existingRoom.users.find(user => user.userName.trim() === userName.trim())) {
        return { error: `User with username ${userName.trim()} already exists in room.`, user: null };
    }
    const user = new UserImpl(userId, uName, roomId, admin, 0);
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
                //setting new admin to one with smallest offset time
                //forces all users offsets to be positive
                rooms[i].users.sort((u1, u2) => u1.offsetTime - u2.offsetTime);
                let newAdminUser = rooms[i].users[0];
                newAdminUser.admin = true;
                //updating all users offset
                rooms[i].users.forEach(user => {
                    if (user !== newAdminUser) {
                        user.offsetTime = user.offsetTime - newAdminUser.offsetTime;
                    }
                });
                newAdminUser.offsetTime = 0;
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