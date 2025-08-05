const urlParams = new URLSearchParams(window.location.search);
const contactId = urlParams.get('contactId');
const contactName = urlParams.get('contactName');

const messagesContainer = document.querySelector('#messages');
const contactInfo = document.querySelector('#contact-info');

let currentUserId = null;
let socket = null;
let deleteMode = false;
let selectedMessages = new Set();

async function loadCurrentUser() {
  const res = await fetch('/api/profile');
  const user = await res.json();
  currentUserId = user._id;

  socket = io();

  socket.on('connect', () => {
    console.log('🔌 Socket.IO подключён');
  });

  socket.on('new_message', ({ from, message, id, timestamp }) => {
    if (from === currentUserId) return;
    appendMessage(false, message, id, timestamp);
  });

  socket.on('messages_deleted', ({ ids }) => {
    ids.forEach(id => {
      const msgDiv = document.querySelector(`[data-id="${id}"]`);
      if (msgDiv) msgDiv.remove();
    });

    selectedMessages.clear();
    const icon = document.getElementById('delete-icon');
    if (icon) icon.remove();
    deleteMode = false;
  });
}

async function loadContactInfo() {
  contactInfo.textContent = `Chat with: ${decodeURIComponent(contactName)}`;
}

async function loadMessages() {
  const res = await fetch(`/api/messages/${contactId}`);
  const messages = await res.json();
  messagesContainer.innerHTML = '';
  messages.forEach(msg => {
    appendMessage(msg.sender === currentUserId, msg.message, msg.id, msg.timestamp);
  });
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function appendMessage(isOwn, text, id = null, timestamp = null) {
  const div = document.createElement('div');
  div.className = isOwn ? 'outgoing' : 'incoming';
  if (id) div.dataset.id = id;

  // Текст сообщения
  const textSpan = document.createElement('span');
  textSpan.textContent = text;
  div.appendChild(textSpan);

  // Время отправки
  if (timestamp) {
    const time = document.createElement('div');
    const date = new Date(timestamp);
    time.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    time.style.fontSize = '0.75em';
    time.style.color = 'gray';
    time.style.marginTop = '4px';
    div.appendChild(time);
  }

  // Если включён режим удаления
  if (deleteMode) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'message-checkbox';
    checkbox.style.marginRight = '6px';
    div.prepend(checkbox);

    checkbox.addEventListener('change', () => {
      if (!id) return;
      if (checkbox.checked) {
        selectedMessages.add(id);
        div.classList.add('selected');
      } else {
        selectedMessages.delete(id);
        div.classList.remove('selected');
      }
    });
  }

  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.querySelector('#message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.querySelector('#message-input');
  const text = input.value.trim();
  if (!text) return;

  const res = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverId: contactId, message: text }),
  });

  const data = await res.json();

  appendMessage(true, text, data.data?.id, data.data?.timestamp);

  socket.emit('send_message', {
    to: contactId,
    message: text,
    id: data.data?.id,
    timestamp: data.data?.timestamp
  });

  input.value = '';
});

messagesContainer.addEventListener('click', (e) => {
  if (e.target.classList.contains('message-checkbox')) return;

  const messageDiv = e.target.closest('.incoming, .outgoing');
  if (!messageDiv) return;

  if (deleteMode) {
    exitDeleteMode();
    return;
  }

  deleteMode = true;

  document.querySelectorAll('#messages > div').forEach((msgDiv) => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'message-checkbox';
    checkbox.style.marginRight = '6px';
    msgDiv.prepend(checkbox);

    checkbox.addEventListener('change', () => {
      const id = msgDiv.dataset.id;
      if (!id) return;

      if (checkbox.checked) {
        selectedMessages.add(id);
        msgDiv.classList.add('selected');
      } else {
        selectedMessages.delete(id);
        msgDiv.classList.remove('selected');
      }
    });
  });

  showDeleteIcon();
});

function showDeleteIcon() {
  const deleteIcon = document.createElement('button');
  deleteIcon.id = 'delete-icon';
  deleteIcon.innerHTML = '🗑️';
  deleteIcon.title = 'Удалить сообщения';
  deleteIcon.style.position = 'absolute';
  deleteIcon.style.top = '10px';
  deleteIcon.style.right = '10px';
  deleteIcon.style.background = 'transparent';
  deleteIcon.style.border = 'none';
  deleteIcon.style.fontSize = '24px';
  deleteIcon.style.cursor = 'pointer';
  deleteIcon.style.zIndex = '1000';

  deleteIcon.addEventListener('click', async () => {
    for (const id of selectedMessages) {
      try {
        await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.error(`Ошибка при удалении ${id}:`, err);
      }
    }

    socket.emit('delete_message', {
      to: contactId,
      ids: Array.from(selectedMessages),
    });

    exitDeleteMode();
  });

  document.body.appendChild(deleteIcon);
}

function exitDeleteMode() {
  deleteMode = false;
  selectedMessages.clear();
  document.querySelectorAll('.message-checkbox').forEach(cb => cb.remove());
  document.querySelectorAll('#messages > div').forEach(msgDiv => msgDiv.classList.remove('selected'));
  const icon = document.getElementById('delete-icon');
  if (icon) icon.remove();
}

// Инициализация
await loadCurrentUser();
await loadContactInfo();
await loadMessages();