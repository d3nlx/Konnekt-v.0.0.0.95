const urlParams = new URLSearchParams(window.location.search);
const contactId = urlParams.get('contactId');

const messagesContainer = document.querySelector('#messages');
const contactInfo = document.querySelector('#contact-info');

let currentUserId = null;

// Загружаем информацию о текущем пользователе
async function loadCurrentUser() {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) throw new Error('Не авторизован');
    const user = await res.json();
    currentUserId = user._id;
  } catch (err) {
    console.error('Ошибка загрузки профиля:', err);
    alert('Ошибка авторизации. Попробуйте войти заново.');
  }
}

// Загружаем имя собеседника
async function loadContactInfo() {
  const res = await fetch(`/api/user/${contactId}`);
  const user = await res.json();
  contactInfo.textContent = `Chat with: ${user.displayName || user.name || user.phonenumber}`;
}

// Загружаем сообщения
async function loadMessages() {
  if (!currentUserId) {
    console.warn("currentUserId еще не определён");
    return;
  }

  const res = await fetch(`/api/messages/${contactId}`);
  const messages = await res.json();

  console.log('Текущий пользователь:', currentUserId);
  console.log('Загруженные сообщения:', messages);

  renderMessages(messages, currentUserId);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// ✅ Рендерим сообщения с чекбоксами и кнопками удаления
function renderMessages(messages, currentUserId) {
  messagesContainer.innerHTML = "";

  messages.forEach((message) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = message.sender === currentUserId ? "outgoing" : "incoming";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("message-checkbox");
    checkbox.dataset.messageId = message.id;
    

    const content = document.createElement("span");
    content.textContent = message.message;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", async () => {
      const confirmed = confirm("Удалить это сообщение и все выбранные?");
      if (!confirmed) return;

      const selectedIds = getSelectedMessageIds();

      // Гарантируем, что сообщение, на которое нажали, тоже будет в списке
      if (!selectedIds.includes(message.id)) {
        selectedIds.push(message.id);
      }

      // Удалим все сообщения по очереди
      for (const id of selectedIds) {
        await fetch(`/api/messages/${id}`, {
          method: "DELETE",
        });
      }

      loadMessages(); // Перезагрузим
    });

    messageDiv.appendChild(checkbox);
    messageDiv.appendChild(content);
    messageDiv.appendChild(deleteBtn);
    messagesContainer.appendChild(messageDiv);
  });
}

// Вспомогательная функция: получить ID всех выделенных чекбоксами сообщений
function getSelectedMessageIds() {
  const checkboxes = document.querySelectorAll(".message-checkbox:checked");
  return Array.from(checkboxes).map((cb) => cb.dataset.messageId);
}

// Отправка нового сообщения
document.querySelector('#message-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.querySelector('#message-input');
  const text = input.value.trim();
  if (!text) return;

  await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverId: contactId, message: text })
  });

  input.value = '';
  await loadMessages();
});

// Инициализация
await loadCurrentUser();
await loadContactInfo();
await loadMessages();
