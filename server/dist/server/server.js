"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("./util");
const constants_1 = require("../sharedmodels/constants");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);
io.on(constants_1.SocketEvents.SERVER_CONNECTION, (socket) => {
    socket.on(constants_1.SocketEvents.TO_SERVER_JOIN, (joinRoomData, callback) => {
        if (!joinRoomData.roomId) {
            return callback('Missing roomid.');
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
            console.log(`User ${joinRoomData.userName} created room ${joinRoomData.roomName}`);
            socket.join(joinRoomData.roomId);
            io.in(joinRoomData.roomId).emit(constants_1.SocketEvents.TO_EXT_ROOM_DATA, { room: util_1.getRoom(joinRoomData.roomId) });
        }
        else if (joinRoomData.action == constants_1.RoomAction.JOIN) {
            const { error, user } = util_1.addUserToRoom(socket.id, joinRoomData.userName, joinRoomData.roomId, false);
            if (error) {
                return callback(error);
            }
            console.log(`User ${joinRoomData.userName} joined room ${util_1.getRoom(joinRoomData.roomId).roomName}`);
            socket.join(joinRoomData.roomId);
            io.in(joinRoomData.roomId).emit(constants_1.SocketEvents.TO_EXT_ROOM_DATA, { room: util_1.getRoom(joinRoomData.roomId) });
            socket.to(joinRoomData.roomId).emit(constants_1.SocketEvents.TO_EXT_USER_CHANGE, {
                userChangeEvent: constants_1.UserChange.JOIN, changedUser: user
            });
            socket.to(util_1.getAdminUserFromRoom(joinRoomData.roomId).userId).emit(constants_1.SocketEvents.TO_SERVER_TO_EXT_SYNC_VIDEO, { userRequestingSync: user, userJoining: true });
        }
        else {
            callback(`Invalid action. Must be ${constants_1.RoomAction.CREATE} OR ${constants_1.RoomAction.JOIN}`);
        }
    });
    socket.on(constants_1.SocketEvents.TO_SERVER_ROOM_DATA, () => {
        socket.emit(constants_1.SocketEvents.TO_EXT_RECIEVE_ROOM_DATA, { room: util_1.getRoomFromUserId(socket.id) });
    });
    socket.on(constants_1.SocketEvents.TO_SERVER_TO_EXT_SYNC_VIDEO, (data, callback) => {
        let userRequestingSync = util_1.getUserFromId(socket.id);
        let userRequestingsSyncRoomAdmin = util_1.getAdminUserFromRoom(userRequestingSync === null || userRequestingSync === void 0 ? void 0 : userRequestingSync.roomId);
        let userToSendSyncReqTo = userRequestingsSyncRoomAdmin;
        if (userRequestingsSyncRoomAdmin) {
            if (userRequestingSync.userId === userRequestingsSyncRoomAdmin.userId) { //i.e admin is requesting a syncing
                let adminRoomUsers = util_1.getRoomFromUserId(userRequestingSync.userId).users;
                if (adminRoomUsers.length === 1) {
                    callback('No one in room to sync to.');
                }
                let randomUserFromRoom = adminRoomUsers[Math.floor(Math.random() * adminRoomUsers.length)]; //get random guy from room that is not admin
                while (randomUserFromRoom.admin) {
                    randomUserFromRoom = adminRoomUsers[Math.floor(Math.random() * adminRoomUsers.length)];
                }
                userToSendSyncReqTo = randomUserFromRoom;
            }
            socket.to(userToSendSyncReqTo.userId).emit(constants_1.SocketEvents.TO_SERVER_TO_EXT_SYNC_VIDEO, { userRequestingSync: userRequestingSync, userJoining: false });
        }
        else {
            callback("Unkown error.");
        }
    });
    socket.on(constants_1.SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, (videoEventData) => {
        //send to specific socket only
        if (!!videoEventData.userIdToSendTo) {
            socket.to(videoEventData.userIdToSendTo).emit(constants_1.SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { videoEvent: videoEventData.videoEvent,
                videoData: videoEventData.videoData, triggeringUser: videoEventData.triggeringUser, error: videoEventData.error });
        }
        else {
            socket.to(util_1.getUserFromId(socket.id).roomId).emit(constants_1.SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { videoEvent: videoEventData.videoEvent,
                videoData: videoEventData.videoData, triggeringUser: videoEventData.triggeringUser, error: videoEventData.error });
        }
    });
    socket.on(constants_1.SocketEvents.TO_SERVER_TO_EXT_CHAT, (msg) => {
        var _a;
        let user = util_1.getUserFromId(socket.id);
        util_1.getRoomFromUserId(user.userId).messages.push(msg);
        socket.to((_a = util_1.getUserFromId(socket.id)) === null || _a === void 0 ? void 0 : _a.roomId).emit(constants_1.SocketEvents.TO_SERVER_TO_EXT_CHAT, msg);
    });
    socket.on(constants_1.SocketEvents.TO_SERVER_SET_OFFSET, (offset) => {
        let user = util_1.getUserFromId(socket.id);
        user.offsetTime = offset.offsetTime;
    });
    socket.on(constants_1.SocketEvents.SERVER_DISCONNECT, () => {
        if (!util_1.getUserFromId(socket.id)) {
            return;
        }
        const { error, deletedUser } = util_1.removeUser(socket.id);
        console.log("Deleted user:");
        console.log(deletedUser);
        if (error) {
            return false;
        }
        socket.to(deletedUser.roomId).emit(constants_1.SocketEvents.TO_EXT_USER_CHANGE, {
            userChangeEvent: constants_1.UserChange.DISCONNECT, changedUser: deletedUser
        });
        io.to(deletedUser.roomId).emit(constants_1.SocketEvents.TO_EXT_ROOM_DATA, { room: util_1.getRoom(deletedUser.roomId) });
    });
    socket.on(constants_1.SocketEvents.TO_SERVER_FORCE_DISCONNECT, () => {
        socket.disconnect();
    });
});
server.listen(3000, () => {
    console.log('listening on *:3000');
});
//# sourceMappingURL=server.js.map