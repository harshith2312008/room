const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (username) => {
    username = username || `User${Math.floor(Math.random()*1000)}`;
    users.set(socket.id, username);
    
    socket.emit('joined', { username, users: Array.from(users.values()) });
    socket.broadcast.emit('userJoined', { username, users: Array.from(users.values()) });
  });

  socket.on('chatMessage', (msg) => {
    const username = users.get(socket.id) || 'Anonymous';
    const messageData = {
      username,
      message: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    io.emit('chatMessage', messageData);
  });

  socket.on('typing', (isTyping) => {
    const username = users.get(socket.id);
    if (username) socket.broadcast.emit('userTyping', { username, isTyping });
  });

  socket.on('disconnect', () => {
    const username = users.get(socket.id);
    users.delete(socket.id);
    if (username) io.emit('userLeft', { username });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
