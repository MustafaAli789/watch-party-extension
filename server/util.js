"use strict";
exports.__esModule = true;
exports.getRoomFromUserId = exports.getRoom = exports.removeUser = exports.addUserToRoom = exports.addRoom = exports.RoomImpl = exports.UserImpl = void 0;
var UserImpl = /** @class */ (function () {
    function UserImpl(userId, userName, roomId) {
        this.userId = userId;
        this.userName = userName;
        this.roomId = roomId;
    }
    return UserImpl;
}());
exports.UserImpl = UserImpl;
var RoomImpl = /** @class */ (function () {
    function RoomImpl(roomId, roomName) {
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
    return RoomImpl;
}());
exports.RoomImpl = RoomImpl;
var rooms = [];
var addRoom = function (roomId, roomName) {
    rooms.push(new RoomImpl(roomId, roomName));
};
exports.addRoom = addRoom;
var addUserToRoom = function (userId, userName, roomId) {
    var uName = userName.trim().toLowerCase();
    var existingRoom = rooms.find(function (room) { return room.roomId == roomId; });
    if (!existingRoom) {
        return { error: "Room with id " + roomId + " does not exist.", user: null };
    }
    var user = new UserImpl(userId, uName, roomId);
    existingRoom.addUser(user);
    return { user: user, error: null };
};
exports.addUserToRoom = addUserToRoom;
var removeUser = function (userId) {
    var deletedUser;
    for (var i = rooms.length - 1; i >= 0; i--) {
        deletedUser = rooms[i].removeUserFromRoom(userId);
        if (deletedUser != null && deletedUser != undefined) {
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
var getRoom = function (roomId) {
    return rooms.find(function (room) { return room.roomId === roomId; });
};
exports.getRoom = getRoom;
var getRoomFromUserId = function (userId) {
    return rooms.find(function (room) { return room.users.find(function (user) { return user.userId === userId; }); });
};
exports.getRoomFromUserId = getRoomFromUserId;
