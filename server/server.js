const express = require('express');
const app = express();
const http = require('http');
const { disconnect } = require('process');
const server = http.createServer(app);
const io = require("socket.io")(server);

const { addUserToRoom, removeUser, addRoom, getUsersInRoom } = require('./util')

const Events = {
  JOIN: 'join',
  CREATED_ROOM: 'created_room',
  ROOM_USERS_DATA: 'room_users_data',
  JOINED_ROOM: 'joined_room',
  DISCONNECT: 'disconnect',
  USER_DISCONNECTED: 'user_disconnected',
  CONNECTION: 'connection',
  FORCE_DISCONNECT: 'force_disconnect'
}


io.on(Events.CONNECTION, (socket) => {

  console.log('A user connected');
  
  socket.on(Events.JOIN, ({roomName, userName, roomId, action}, callback) => {

    if (action == "CREATE") {
      addRoom(roomId, roomName)
      const { error, user } = addUserToRoom(socket.id, userName, roomId)

      if (error) {
        console.log("shouldnt happen theoretically")
        return
      }

      socket.join(roomId)
      socket.emit(Events.CREATED_ROOM, { payload: getUsersInRoom(roomId) })
    } else if (action == "JOIN"){
      const { error, user } = addUserToRoom(socket.id, userName, roomId)

      if (error) {
        return callback(error)
      }

      socket.emit(Events.JOINED_ROOM, { payload: `You have successfuly joined room ${roomName}` })
      io.to(roomId).emit(Events.ROOM_USERS_DATA, { payload: getUsersInRoom(roomId) })
    } else {
      callback('Invalid action. Must be JOIN or CREATE')
    }
  });

  socket.on(Events.DISCONNECT, () => {
    disconnectSocket(socket, io)
  });

  socket.on(Events.FORCE_DISCONNECT, () => {
    socket.disconnect()
  })

});

function disconnectSocket(socket, io) {
  const { error, deletedUser } = removeUser(socket.id)

  console.log("Deleted user:")
  console.log(deletedUser)

  if (error) {
    console.log("shouldnt happen theoretiically")
    return false
  }
  io.to(deletedUser.roomId).emit(Events.USER_DISCONNECTED, { payload: `User with name: ${deletedUser.userName} has left the room` })
  io.to(deletedUser.roomId).emit(Events.ROOM_USERS_DATA, { payload: getUsersInRoom(deletedUser.roomId) })
  return true
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});