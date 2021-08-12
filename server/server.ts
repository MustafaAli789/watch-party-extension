import { Server, Socket } from 'socket.io';
import { addUserToRoom, removeUser, addRoom, getRoom, getRoomFromUserId, getAdminUserFromRoom, getUserFromId } from './util'
import { SocketEvents, RoomAction, UserChange } from '../sharedmodels/constants'

import { ToServerJoinRoomPayload, ToExtRoomDataPayload, ToExtUserChangePayload, ToServerVideoEventPayload, ToExtVideoEventPayload, ToExtSyncVideoPayload } from '../sharedmodels/payloads'
import { Message } from '../sharedmodels/message';
import { User } from '../sharedmodels/user';
import { Room } from '../sharedmodels/room';

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io: Server = require("socket.io")(server);

io.on(SocketEvents.SERVER_CONNECTION, (socket) => {
  
  socket.on(SocketEvents.TO_SERVER_JOIN, (joinRoomData: ToServerJoinRoomPayload, callback) => {

    if (!joinRoomData.roomId) {
      return callback('Missing roomid.')
    }

    if (joinRoomData.action == RoomAction.CREATE) {

      if (!joinRoomData.roomName) {
        return callback('RoomName cannot be empty when creating a room.')
      }

      addRoom(joinRoomData.roomId, joinRoomData.roomName)
      const { error } = addUserToRoom(socket.id, joinRoomData.userName, joinRoomData.roomId, true)

      if (error) {
        console.log('shouldnt happen')
        return callback(error)
      }

      console.log(`User ${joinRoomData.userName} created room ${joinRoomData.roomName}`);

      socket.join(joinRoomData.roomId)
      io.in(joinRoomData.roomId).emit(SocketEvents.TO_EXT_ROOM_DATA, { room: getRoom(joinRoomData.roomId) } as ToExtRoomDataPayload)
    } else if (joinRoomData.action == RoomAction.JOIN){
      const { error, user } = addUserToRoom(socket.id, joinRoomData.userName, joinRoomData.roomId, false)

      if (error) {
        return callback(error)
      }

      console.log(`User ${joinRoomData.userName} joined room ${getRoom(joinRoomData.roomId).roomName}`);

      socket.join(joinRoomData.roomId)
      io.in(joinRoomData.roomId).emit(SocketEvents.TO_EXT_ROOM_DATA, { room: getRoom(joinRoomData.roomId) } as ToExtRoomDataPayload)
      socket.to(joinRoomData.roomId).emit(SocketEvents.TO_EXT_USER_CHANGE, { 
        userChangeEvent: UserChange.JOIN, changedUser: user } as ToExtUserChangePayload)
      socket.to(getAdminUserFromRoom(joinRoomData.roomId).userId).emit(SocketEvents.TO_SERVER_TO_EXT_SYNC_VIDEO, { userRequestingSync: user, userJoining: true } as ToExtSyncVideoPayload)
    } else {
      callback(`Invalid action. Must be ${RoomAction.CREATE} OR ${RoomAction.JOIN}`)
    }
  });

  socket.on(SocketEvents.TO_SERVER_ROOM_DATA, () => {
    socket.emit(SocketEvents.TO_EXT_RECIEVE_ROOM_DATA, { room: getRoomFromUserId(socket.id) } as ToExtRoomDataPayload)
  })

  socket.on(SocketEvents.TO_SERVER_TO_EXT_SYNC_VIDEO, (data, callback) => {
    let userRequestingSync = getUserFromId(socket.id)
    let userRequestingsSyncRoomAdmin = getAdminUserFromRoom(userRequestingSync?.roomId)
    let userToSendSyncReqTo = userRequestingsSyncRoomAdmin

    if (userRequestingsSyncRoomAdmin) {
      if (userRequestingSync.userId === userRequestingsSyncRoomAdmin.userId) { //i.e admin is requesting a syncing
        let adminRoomUsers = getRoomFromUserId(userRequestingSync.userId).users
        
        if (adminRoomUsers.length === 1) {
          callback('No one in room to sync to.')
        }

        let randomUserFromRoom = adminRoomUsers[Math.floor(Math.random()*adminRoomUsers.length)] //get random guy from room that is not admin
        while (randomUserFromRoom.admin) {
          randomUserFromRoom = adminRoomUsers[Math.floor(Math.random()*adminRoomUsers.length)]
        }

        userToSendSyncReqTo = randomUserFromRoom
      }

      socket.to(userToSendSyncReqTo.userId).emit(SocketEvents.TO_SERVER_TO_EXT_SYNC_VIDEO, { userRequestingSync: userRequestingSync, userJoining: false } as ToExtSyncVideoPayload)

    } else {
      callback("Unkown error.")
    }
  })

  socket.on(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, (videoEventData: ToServerVideoEventPayload) => {
  
    //send to specific socket only
    if (!!videoEventData.userIdToSendTo) {
      socket.to(videoEventData.userIdToSendTo).emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { videoEvent: videoEventData.videoEvent, 
        videoData: videoEventData.videoData, triggeringUser: videoEventData.triggeringUser, error: videoEventData.error } as ToExtVideoEventPayload)
    } else {
      socket.to(getUserFromId(socket.id).roomId).emit(SocketEvents.TO_SERVER_TO_EXT_VIDEO_EVENT, { videoEvent: videoEventData.videoEvent, 
        videoData: videoEventData.videoData, triggeringUser: videoEventData.triggeringUser, error: videoEventData.error } as ToExtVideoEventPayload)
    }
  })

  socket.on(SocketEvents.TO_SERVER_TO_EXT_CHAT, (msg: Message) => {
    let user: User = getUserFromId(socket.id)
    getRoomFromUserId(user.userId).messages.push(msg)
    socket.to(getUserFromId(socket.id)?.roomId).emit(SocketEvents.TO_SERVER_TO_EXT_CHAT, msg)
  })

  socket.on(SocketEvents.SERVER_DISCONNECT, () => {
    if(!getUserFromId(socket.id)) {
      return
    }

    const { error, deletedUser } = removeUser(socket.id)
  
    console.log("Deleted user:")
    console.log(deletedUser)
  
    if (error) {
      return false
    }
  
    socket.to(deletedUser.roomId).emit(SocketEvents.TO_EXT_USER_CHANGE, { 
      userChangeEvent: UserChange.DISCONNECT, changedUser: deletedUser } as ToExtUserChangePayload)
    io.to(deletedUser.roomId).emit(SocketEvents.TO_EXT_ROOM_DATA, { room: getRoom(deletedUser.roomId) } as ToExtRoomDataPayload)
  });

  socket.on(SocketEvents.TO_SERVER_FORCE_DISCONNECT, () => {
    socket.disconnect()
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});