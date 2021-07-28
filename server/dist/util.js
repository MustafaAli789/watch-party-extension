"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsersInRoom = exports.removeUser = exports.addUserToRoom = exports.addRoom = exports.Room = exports.User = void 0;
var User = /** @class */ (function () {
    function User(userId, userName, roomId) {
        this.userId = userId;
        this.userName = userName;
        this.roomId = roomId;
    }
    return User;
}());
exports.User = User;
var Room = /** @class */ (function () {
    function Room(roomId, roomName) {
        var _this = this;
        this.users = [];
        this.addUser = function (user) {
            _this.users.push(user);
        };
        this.removeUserFromRoom = function (userId) {
            var userToDel;
            var indToDel = _this.users.map(function (user) { return user.userId; }).indexOf(userId);
            if (indToDel != null && indToDel != undefined) {
                userToDel = _this.users[indToDel];
                _this.users.splice(indToDel, 1);
                return userToDel;
            }
            else {
                return null;
            }
        };
        this.roomId = roomId;
        this.roomName = roomName;
    }
    return Room;
}());
exports.Room = Room;
var rooms = [];
var addRoom = function (roomId, roomName) {
    rooms.push(new Room(roomId, roomName));
};
exports.addRoom = addRoom;
var addUserToRoom = function (userId, userName, roomId) {
    var uName = userName.trim().toLowerCase();
    var existingRoom = rooms.find(function (room) { return room.roomId == roomId; });
    if (!existingRoom) {
        return { error: "Room with id " + roomId + " does not exist.", user: null };
    }
    var user = new User(userId, uName, roomId);
    existingRoom.addUser(user);
    return { user: user, error: null };
};
exports.addUserToRoom = addUserToRoom;
var removeUser = function (userId) {
    var deletedUser;
    for (var i = 0; i < rooms.length; i++) {
        deletedUser = rooms[i].removeUserFromRoom(userId);
        if (deletedUser != null) {
            //special check to see if room empty i.e last person in room left
            if (rooms[i].users.length == 0) {
                rooms.splice(i, 1);
            }
            return { deletedUser: deletedUser, error: null };
        }
    }
    return { error: "User with id " + userId + " does not exist", deletedUser: null };
};
exports.removeUser = removeUser;
var getUsersInRoom = function (roomId) {
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        if (room.roomId == roomId) {
            return room.users;
        }
    }
    return [];
};
exports.getUsersInRoom = getUsersInRoom;
//module.exports={ addRoom, removeUser, addUserToRoom, getUsersInRoom }
//# sourceMappingURL=util.js.map