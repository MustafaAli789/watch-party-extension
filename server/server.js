"use strict";
exports.__esModule = true;
var util_1 = require("./util");
var constants_1 = require("../sharedmodels/constants");
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require("socket.io")(server);
io.on(constants_1.SocketEvents.CONNECTION, function (socket) {
    console.log('A user connected');
    socket.on(constants_1.SocketEvents.JOIN, function (joinRoomData, callback) {
        if (!joinRoomData.roomId) {
            return callback('Missing roomid');
        }
        if (joinRoomData.action == constants_1.RoomAction.CREATE) {
            if (!joinRoomData.roomName) {
                return callback('RoomName cannot be empty when creating a room.');
            }
            util_1.addRoom(joinRoomData.roomId, joinRoomData.roomName);
            var error = util_1.addUserToRoom(socket.id, joinRoomData.userName, joinRoomData.roomId).error;
            if (error) {
                console.log('shouldnt happen');
                return callback(error);
            }
            socket.join(joinRoomData.roomId);
            socket.emit(constants_1.SocketEvents.CREATED_ROOM, { room: util_1.getRoom(joinRoomData.roomId) });
        }
        else if (joinRoomData.action == constants_1.RoomAction.JOIN) {
            var error = util_1.addUserToRoom(socket.id, joinRoomData.userName, joinRoomData.roomId).error;
            if (error) {
                return callback(error);
            }
            socket.emit(constants_1.SocketEvents.JOINED_ROOM, { room: util_1.getRoom(joinRoomData.roomId) });
            socket.to(joinRoomData.roomId).emit(constants_1.SocketEvents.ROOM_DATA, { room: util_1.getRoom(joinRoomData.roomId) });
            socket.to(joinRoomData.roomId).emit(constants_1.SocketEvents.USER_CONNECTED, { message: "User with name: " + joinRoomData.userName + " has joined the room" });
        }
        else {
            callback("Invalid action. Must be " + constants_1.RoomAction.CREATE + " OR " + constants_1.RoomAction.JOIN);
        }
    });
    socket.on(constants_1.SocketEvents.GET_ROOM_DATA, function () {
        socket.emit(constants_1.SocketEvents.RECIEVE_ROOM_DATA, { room: util_1.getRoomFromUserId(socket.id) });
    });
    socket.on(constants_1.SocketEvents.DISCONNECT, function () {
        disconnectSocket(socket, io);
    });
    socket.on(constants_1.SocketEvents.FORCE_DISCONNECT, function () {
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
    socket.to(deletedUser.roomId).emit(constants_1.SocketEvents.USER_DISCONNECTED, { message: "User with name: " + deletedUser.userName + " has left the room" });
    socket.to(deletedUser.roomId).emit(constants_1.SocketEvents.ROOM_DATA, { room: util_1.getRoom(deletedUser.roomId) });
    return true;
}
server.listen(3000, function () {
    console.log('listening on *:3000');
});
