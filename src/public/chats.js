document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('contacts-list');
  const form = document.getElementById('add-contact-form');
  const input = document.getElementById('phonenumber');

  // Загрузка контактов с сервера
  async function loadContacts() {
    const res = await fetch('/api/contacts', { credentials: 'include' });
    const contacts = await res.json();

    list.innerHTML = ''; // Очищаем список
    contacts.forEach(c => {
      const li = document.createElement('li');

      const text = document.createElement('span');
      text.textContent = `${c.displayName} (${c.phonenumber})`;
      text.style.cursor = 'pointer';
      text.onclick = () => {
        window.location.href = `chat.html?contactId=${c.id}&contactName=${encodeURIComponent(c.displayName)}`;
      };

      const del = document.createElement('button');
      del.textContent = '✕';
      del.style.marginLeft = '10px';
      del.style.color = 'red';
      del.onclick = async (e) => {
        e.stopPropagation();
        const confirmed = confirm(`Удалить ${c.displayName} из контактов?`);
        if (!confirmed) return;

        await fetch(`/api/contacts/${c.contactEntryId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        await loadContacts();
      };

      li.appendChild(text);
      li.appendChild(del);
      list.appendChild(li);
    });
  }

  // Добавление нового контакта
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const number = input.value.trim();
    if (!number) return;

    await fetch('/api/contacts', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: number })
    });

    input.value = '';
    await loadContacts();
  });

  document.querySelector('.back-to-user-page-button-js').addEventListener('click', () => {
    window.location.href = 'profile.html';
  });

  loadContacts();
});