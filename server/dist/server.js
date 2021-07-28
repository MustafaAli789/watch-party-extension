"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var socketEvents_1 = require("./socketEvents");
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require("socket.io")(server);
io.on(socketEvents_1.default.CONNECTION, function (socket) {
    console.log('A user connected');
    socket.on(socketEvents_1.default.JOIN, function (_a, callback) {
        var roomName = _a.roomName, userName = _a.userName, roomId = _a.roomId, action = _a.action;
        if (action == "CREATE") {
            util_1.addRoom(roomId, roomName);
            var _b = util_1.addUserToRoom(socket.id, userName, roomId), error = _b.error, user = _b.user;
            if (error) {
                console.log("shouldnt happen theoretically");
                return;
            }
            socket.join(roomId);
            socket.emit(socketEvents_1.default.CREATED_ROOM, { payload: util_1.getUsersInRoom(roomId) });
        }
        else if (action == "JOIN") {
            var _c = util_1.addUserToRoom(socket.id, userName, roomId), error = _c.error, user = _c.user;
            if (error) {
                return callback(error);
            }
            socket.emit(socketEvents_1.default.JOINED_ROOM, { payload: "You have successfuly joined room " + roomName });
            io.to(roomId).emit(socketEvents_1.default.ROOM_USERS_DATA, { payload: util_1.getUsersInRoom(roomId) });
        }
        else {
            callback('Invalid action. Must be JOIN or CREATE');
        }
    });
    socket.on(socketEvents_1.default.DISCONNECT, function () {
        disconnectSocket(socket, io);
    });
    socket.on(socketEvents_1.default.FORCE_DISCONNECT, function () {
        socket.disconnect();
    });
});
function disconnectSocket(socket, io) {
    var _a = util_1.removeUser(socket.id), error = _a.error, deletedUser = _a.deletedUser;
    console.log("Deleted user:");
    console.log(deletedUser);
    if (error) {
        console.log("shouldnt happen theoretiically");
        return false;
    }
    io.to(deletedUser.roomId).emit(socketEvents_1.default.USER_DISCONNECTED, { payload: "User with name: " + deletedUser.userName + " has left the room" });
    io.to(deletedUser.roomId).emit(socketEvents_1.default.ROOM_USERS_DATA, { payload: util_1.getUsersInRoom(deletedUser.roomId) });
    return true;
}
server.listen(3000, function () {
    console.log('listening on *:3000');
});
//# sourceMappingURL=server.js.map