import { Server, Socket } from 'socket.io';
import { addUserToRoom, removeUser, addRoom, getUsersInRoom, User, Room } from './util'
import SocketEvents from '../socketEvents'

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io: Server = require("socket.io")(server);

io.on(SocketEvents.CONNECTION, (socket) => {

  console.log('A user connected');
  
  socket.on(SocketEvents.JOIN, ({roomName, userName, roomId, action}, callback) => {

    if (action == "CREATE") {
      addRoom(roomId, roomName)
      const { error, user } = addUserToRoom(socket.id, userName, roomId)

      if (error) {
        console.log("shouldnt happen theoretically")
        return
      }

      socket.join(roomId)
      socket.emit(SocketEvents.CREATED_ROOM, { payload: getUsersInRoom(roomId) })
    } else if (action == "JOIN"){
      const { error, user } = addUserToRoom(socket.id, userName, roomId)

      if (error) {
        return callback(error)
      }

      socket.emit(SocketEvents.JOINED_ROOM, { payload: `You have successfuly joined room ${roomName}` })
      io.to(roomId).emit(SocketEvents.ROOM_USERS_DATA, { payload: getUsersInRoom(roomId) })
    } else {
      callback('Invalid action. Must be JOIN or CREATE')
    }
  });

  socket.on(SocketEvents.DISCONNECT, () => {
    disconnectSocket(socket, io)
  });

  socket.on(SocketEvents.FORCE_DISCONNECT, () => {
    socket.disconnect()
  })

});

function disconnectSocket(socket: Socket, io) {
  const { error, deletedUser } = removeUser(socket.id)

  console.log("Deleted user:")
  console.log(deletedUser)

  if (error) {
    console.log("shouldnt happen theoretiically")
    return false
  }

  io.to(deletedUser.roomId).emit(SocketEvents.USER_DISCONNECTED, { payload: `User with name: ${deletedUser.userName} has left the room` })
  io.to(deletedUser.roomId).emit(SocketEvents.ROOM_USERS_DATA, { payload: getUsersInRoom(deletedUser.roomId) })
  return true
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});