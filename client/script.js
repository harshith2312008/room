const socket = io('http://localhost:3000');

let username = '';

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const usersList = document.getElementById('users-list');
const typingIndicator = document.getElementById('typing-indicator');

function joinRoom() {
  username = usernameInput.value.trim() || 'User' + Math.floor(Math.random()*9999);

  loginScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');

  socket.emit('join', username);
}

function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg) {
    socket.emit('chatMessage', msg);
    messageInput.value = '';
  }
}

socket.on('connect', () => console.log('Connected'));

socket.on('joined', (data) => {
  addMessage(`Welcome, ${data.username}!`, 'system');
  updateUsersList(data.users);
});

socket.on('userJoined', (data) => {
  addMessage(`${data.username} joined`, 'system');
  updateUsersList(data.users);
});

socket.on('userLeft', (data) => {
  addMessage(`${data.username} left`, 'system');
});

socket.on('chatMessage', (data) => {
  const isSelf = data.username === username;
  addMessage(data.message, isSelf ? 'self' : 'other', data.username, data.time);
});

function addMessage(text, type, sender='', time='') {
  const div = document.createElement('div');
  div.className = `message ${type}`;
  if (type === 'system') {
    div.innerHTML = `<span style="color:#aaa">${text}</span>`;
  } else {
    div.innerHTML = `<div class="username">${sender}</div><div>${text}</div><div class="time">${time}</div>`;
  }
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateUsersList(users) {
  usersList.innerHTML = '';
  users.forEach(u => {
    const d = document.createElement('div');
    d.textContent = `● ${u}`;
    d.style.padding = '10px';
    usersList.appendChild(d);
  });
}

messageInput.addEventListener('keypress', e => { if(e.key==='Enter') sendMessage(); });
usernameInput.addEventListener('keypress', e => { if(e.key==='Enter') joinRoom(); });
