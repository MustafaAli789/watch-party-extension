const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  //io.emit('hello', { someProperty: 'some value', otherProperty: 'other value' });
  socket.on('join', ({room}) => {
    socket.join(room)
    socket.emit('joined_room', "Successfully joined room " + room)
  });
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});