const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);

const { addUserToRoom, removeUser, addRoom, getUsersInRoom } = require('./util')

io.on('connection', (socket) => {

  console.log('A user connected');
  
  socket.on('join', ({roomName, userName, roomId, action}, callback) => {

    if (action == "CREATE") {
      addRoom(roomId, roomName)
      const { error, user } = addUserToRoom(socket.id, userName, roomId)

      if (error) {
        console.log("shouldnt happen theoretically")
        return
      }

      socket.join(roomId)
      socket.emit("created_room", { payload: `You have successfuly created room ${roomName}` })
      socket.emit("room_users_data", { payload: getUsersInRoom(roomId) })
    } else if (action == "JOIN"){
      const { error, user } = addUserToRoom(socket.id, userName, roomId)

      if (error) {
        return callback(error)
      }

      socket.emit("joined_room", { payload: `You have successfuly joined room ${roomName}` })
      io.to(roomId).emit("room_users_data", { payload: getUsersInRoom(roomId) })
    } else {
      callback('Invalid action. Must be JOIN or CREATE')
    }
  });

  socket.on('disconnect', (callback) => {
    const { error, deletedUser } = removeUser(socket.id)
    if (error) {
      callback('Cannot find user')
    }
    io.to(deletedUser.roomId).emit("user_disconnected", { payload: `User with name: ${deletedUser.userName} has left the room` })
  });

});

server.listen(3000, () => {
  console.log('listening on *:3000');
});