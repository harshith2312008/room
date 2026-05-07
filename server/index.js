const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const SECRET = "harshith-room-secret-2026";
let usersDB = [];

if (fs.existsSync('users.json')) {
  usersDB = JSON.parse(fs.readFileSync('users.json'));
}

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (usersDB.find(u => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }
  const hashed = await bcrypt.hash(password, 10);
  usersDB.push({ username, password: hashed });
  fs.writeFileSync('users.json', JSON.stringify(usersDB));
  res.json({ success: true });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = usersDB.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, SECRET, { expiresIn: '24h' });
  res.json({ token, username });
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("No token"));

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return next(new Error("Invalid token"));
    socket.username = decoded.username;
    next();
  });
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log(`${socket.username} connected`);

  onlineUsers.set(socket.id, socket.username);
  io.emit('onlineUsers', Array.from(onlineUsers.values()));

  socket.on('chatMessage', (data) => {
    io.emit('chatMessage', {
      username: socket.username,
      message: data.message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.values()));
  });
});

server.listen(3000, () => console.log('🚀 Server running on http://localhost:3000'));