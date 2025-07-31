const urlParams = new URLSearchParams(window.location.search);
const contactId = urlParams.get('contactId');
const contactName = urlParams.get('contactName');

const messagesContainer = document.querySelector('#messages');
const contactInfo = document.querySelector('#contact-info');

let currentUserId = null;
let socket = null;

async function loadCurrentUser() {
  const res = await fetch('/api/profile');
  const user = await res.json();
  currentUserId = user._id;

  socket = io(); // Подключение к сокету

  socket.on('connect', () => {
    console.log('🔌 Socket.IO подключён');
  });

  socket.on('new_message', (data) => {
    const { from, message } = data;
    if (from === contactId || from === currentUserId) {
      appendMessage(from === currentUserId, message);
    }
  });
}

async function loadContactInfo() {
  contactInfo.textContent = `Chat with: ${decodeURIComponent(contactName)}`;
}

async function loadMessages() {
  const res = await fetch(`/api/messages/${contactId}`);
  const messages = await res.json();
  messagesContainer.innerHTML = '';
  messages.forEach(msg => appendMessage(msg.sender === currentUserId, msg.message));
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendMessage(isOwn, text) {
  const div = document.createElement('div');
  div.className = isOwn ? 'outgoing' : 'incoming';
  div.textContent = text;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.querySelector('#message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.querySelector('#message-input');
  const text = input.value.trim();
  if (!text) return;

  // Отправка на сервер
  await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverId: contactId, message: text }),
  });

  // Отправка по сокету
  socket.emit('send_message', {
    to: contactId,
    message: text,
  });

  input.value = '';
});

// Инициализация
await loadCurrentUser();
await loadContactInfo();
await loadMessages();
