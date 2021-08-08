import { Server, Socket } from 'socket.io';
import { addUserToRoom, removeUser, addRoom, getRoom, getRoomFromUserId, getAdminUserFromRoom, getUserFromId } from './util'
import { SocketEvents, RoomAction, UserChange } from '../sharedmodels/constants'

import { SocketJoinRoomPayload, SocketRoomDataPayload, SocketUserChangePayload, SocketCreateVideoEventPayload, SocketGetVideoEventPayload } from '../sharedmodels/payloads'

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io: Server = require("socket.io")(server);

io.on(SocketEvents.CONNECTION, (socket) => {
  
  socket.on(SocketEvents.JOIN, (joinRoomData: SocketJoinRoomPayload, callback) => {

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
      socket.emit(SocketEvents.CONNECTED_TO_ROOM, { room: getRoom(joinRoomData.roomId) } as SocketRoomDataPayload)
    } else if (joinRoomData.action == RoomAction.JOIN){
      const { error, user } = addUserToRoom(socket.id, joinRoomData.userName, joinRoomData.roomId, false)

      if (error) {
        return callback(error)
      }

      console.log(`User ${joinRoomData.userName} joined room ${getRoom(joinRoomData.roomId).roomName}`);

      socket.join(joinRoomData.roomId)
      socket.emit(SocketEvents.CONNECTED_TO_ROOM, { room: getRoom(joinRoomData.roomId) } as SocketRoomDataPayload)
      socket.to(joinRoomData.roomId).emit(SocketEvents.ROOM_DATA, { room: getRoom(joinRoomData.roomId) } as SocketRoomDataPayload)
      socket.broadcast.to(joinRoomData.roomId).emit(SocketEvents.USER_CHANGE, { 
        changeEvent: UserChange.JOIN, changedUser: user, admin: getAdminUserFromRoom(joinRoomData.roomId) } as SocketUserChangePayload)
    } else {
      callback(`Invalid action. Must be ${RoomAction.CREATE} OR ${RoomAction.JOIN}`)
    }
  });

  socket.on(SocketEvents.GET_ROOM_DATA, () => {
    socket.emit(SocketEvents.RECIEVE_ROOM_DATA, { room: getRoomFromUserId(socket.id) } as SocketRoomDataPayload)
  })

  socket.on(SocketEvents.VIDEO_EVENT, (videoEventData: SocketCreateVideoEventPayload) => {
  
    //send to specific socket only
    if (!!videoEventData.userIdToSendTo) {
      socket.to(videoEventData.userIdToSendTo).emit(SocketEvents.VIDEO_EVENT, { videoEvent: videoEventData.videoEvent, 
        videoData: videoEventData.videoData, triggeringUser: getUserFromId(videoEventData.triggeringUserId) } as SocketGetVideoEventPayload)
    } else {
      socket.broadcast.to(getUserFromId(socket.id).roomId).emit(SocketEvents.VIDEO_EVENT, { videoEvent: videoEventData.videoEvent, 
        videoData: videoEventData.videoData, triggeringUser: getUserFromId(videoEventData.triggeringUserId) } as SocketGetVideoEventPayload)
    }
  })

  socket.on(SocketEvents.DISCONNECT, () => {
    const { error, deletedUser } = removeUser(socket.id)
  
    console.log("Deleted user:")
    console.log(deletedUser)
  
    if (error) {
      console.log("shouldnt happen theoretiically")
      return false
    }
  
    socket.broadcast.to(deletedUser.roomId).emit(SocketEvents.USER_CHANGE, { 
      changeEvent: UserChange.DISCONNECT, changedUser: deletedUser, admin: getAdminUserFromRoom(deletedUser.roomId) } as SocketUserChangePayload)
    socket.to(deletedUser.roomId).emit(SocketEvents.ROOM_DATA, { room: getRoom(deletedUser.roomId) } as SocketRoomDataPayload)
  });

  socket.on(SocketEvents.FORCE_DISCONNECT, () => {
    socket.disconnect()
  })
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});