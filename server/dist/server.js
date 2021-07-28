"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const socketEvents_1 = require("./socketEvents");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
io.on(socketEvents_1.default.CONNECTION, (socket) => {
    console.log('A user connected');
    socket.on(socketEvents_1.default.JOIN, ({ roomName, userName, roomId, action }, callback) => {
        if (action == "CREATE") {
            util_1.addRoom(roomId, roomName);
            const { error, user } = util_1.addUserToRoom(socket.id, userName, roomId);
            if (error) {
                console.log("shouldnt happen theoretically");
                return;
            }
            socket.join(roomId);
            socket.emit(socketEvents_1.default.CREATED_ROOM, { payload: util_1.getUsersInRoom(roomId) });
        }
        else if (action == "JOIN") {
            const { error, user } = util_1.addUserToRoom(socket.id, userName, roomId);
            if (error) {
                return callback(error);
            }
            socket.emit(socketEvents_1.default.JOINED_ROOM, { payload: `You have successfuly joined room ${roomName}` });
            io.to(roomId).emit(socketEvents_1.default.ROOM_USERS_DATA, { payload: util_1.getUsersInRoom(roomId) });
        }
        else {
            callback('Invalid action. Must be JOIN or CREATE');
        }
    });
    socket.on(socketEvents_1.default.DISCONNECT, () => {
        disconnectSocket(socket, io);
    });
    socket.on(socketEvents_1.default.FORCE_DISCONNECT, () => {
        socket.disconnect();
    });
});
function disconnectSocket(socket, io) {
    const { error, deletedUser } = util_1.removeUser(socket.id);
    console.log("Deleted user:");
    console.log(deletedUser);
    if (error) {
        console.log("shouldnt happen theoretiically");
        return false;
    }
    io.to(deletedUser.roomId).emit(socketEvents_1.default.USER_DISCONNECTED, { payload: `User with name: ${deletedUser.userName} has left the room` });
    io.to(deletedUser.roomId).emit(socketEvents_1.default.ROOM_USERS_DATA, { payload: util_1.getUsersInRoom(deletedUser.roomId) });
    return true;
}
server.listen(3000, () => {
    console.log('listening on *:3000');
});
//# sourceMappingURL=server.js.map