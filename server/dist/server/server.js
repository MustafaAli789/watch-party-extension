"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const constants_1 = require("../sharedmodels/constants");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
io.on(constants_1.SocketEvents.CONNECTION, (socket) => {
    console.log('A user connected');
    socket.on(constants_1.SocketEvents.JOIN, (joinRoomData, callback) => {
        if (!joinRoomData.roomId) {
            return callback('Missing roomid');
        }
        if (joinRoomData.action == constants_1.RoomAction.CREATE) {
            if (!joinRoomData.roomName) {
                return callback('RoomName cannot be empty when creating a room.');
            }
            util_1.addRoom(joinRoomData.roomId, joinRoomData.roomName);
            const { error } = util_1.addUserToRoom(socket.id, joinRoomData.userName, joinRoomData.roomId, true);
            if (error) {
                console.log('shouldnt happen');
                return callback(error);
            }
            socket.join(joinRoomData.roomId);
            socket.emit(constants_1.SocketEvents.CREATED_ROOM, { room: util_1.getRoom(joinRoomData.roomId) });
        }
        else if (joinRoomData.action == constants_1.RoomAction.JOIN) {
            const { error, user } = util_1.addUserToRoom(socket.id, joinRoomData.userName, joinRoomData.roomId, false);
            if (error) {
                return callback(error);
            }
            socket.join(joinRoomData.roomId);
            socket.emit(constants_1.SocketEvents.JOINED_ROOM, { room: util_1.getRoom(joinRoomData.roomId) });
            socket.to(joinRoomData.roomId).emit(constants_1.SocketEvents.ROOM_DATA, { room: util_1.getRoom(joinRoomData.roomId) });
            socket.broadcast.to(joinRoomData.roomId).emit(constants_1.SocketEvents.USER_CHANGE, {
                changeEvent: constants_1.UserChange.JOIN, changedUser: user, admin: util_1.getAdminUserFromRoom(joinRoomData.roomId)
            });
        }
        else {
            callback(`Invalid action. Must be ${constants_1.RoomAction.CREATE} OR ${constants_1.RoomAction.JOIN}`);
        }
    });
    socket.on(constants_1.SocketEvents.GET_ROOM_DATA, () => {
        socket.emit(constants_1.SocketEvents.RECIEVE_ROOM_DATA, { room: util_1.getRoomFromUserId(socket.id) });
    });
    socket.on(constants_1.SocketEvents.VIDEO_EVENT, (videoEventData) => {
        //send to specific socket only
        if (!!videoEventData.userIdToSendTo) {
            socket.to(videoEventData.userIdToSendTo).emit(constants_1.SocketEvents.VIDEO_EVENT, { videoEvent: videoEventData.videoEvent,
                videoData: videoEventData.videoData, triggeringUser: util_1.getUserFromId(videoEventData.triggeringUserId) });
        }
        else {
            socket.broadcast.to(util_1.getUserFromId(socket.id).roomId).emit(constants_1.SocketEvents.VIDEO_EVENT, { videoEvent: videoEventData.videoEvent,
                videoData: videoEventData.videoData, triggeringUser: util_1.getUserFromId(videoEventData.triggeringUserId) });
        }
    });
    socket.on(constants_1.SocketEvents.DISCONNECT, () => {
        const { error, deletedUser } = util_1.removeUser(socket.id);
        console.log("Deleted user:");
        console.log(deletedUser);
        if (error) {
            console.log("shouldnt happen theoretiically");
            return false;
        }
        socket.broadcast.to(deletedUser.roomId).emit(constants_1.SocketEvents.USER_CHANGE, {
            changeEvent: constants_1.UserChange.DISCONNECT, changedUser: deletedUser, admin: util_1.getAdminUserFromRoom(deletedUser.roomId)
        });
        socket.to(deletedUser.roomId).emit(constants_1.SocketEvents.ROOM_DATA, { room: util_1.getRoom(deletedUser.roomId) });
    });
    socket.on(constants_1.SocketEvents.FORCE_DISCONNECT, () => {
        socket.disconnect();
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
//# sourceMappingURL=server.js.map