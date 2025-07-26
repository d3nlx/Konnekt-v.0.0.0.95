document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch('/api/profile', {
      credentials: 'include',
    });

    if (!res.ok) {
      window.location.href = 'login.html';
      return;
    }

    const user = await res.json();

    document.querySelector('.js-name').textContent = user.name;
    document.querySelector('.js-display-name').textContent = user.displayName;
    document.querySelector('.js-phonenumber').textContent = user.phonenumber;
    document.querySelector('.js-password').textContent = user.password; // still temporarily shown
  } catch (err) {
    console.error('Error loading profile', err);
    window.location.href = 'login.html';
  }
});

async function updateProfileField(field, value) {
  const res = await fetch('/api/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ [field]: value }),
  });

  if (res.ok) {
    alert('Updated successfully!');
    window.location.reload();
  } else {
    const error = await res.text();
    alert('Error: ' + error);
  }
}

// Change name
document.querySelector('.js-change-name-button').addEventListener('click', () => {
  const value = document.querySelector('.js-name-input').value.trim();
  if (value) updateProfileField('name', value);
});

// Change display name
document.querySelector('.js-change-display-name-button').addEventListener('click', () => {
  const value = document.querySelector('.js-display-name-input').value.trim();
  if (value) updateProfileField('displayName', value);
});

// Change phone number
document.querySelector('.js-change-phonenumber-button').addEventListener('click', () => {
  const value = document.querySelector('.js-phonenumber-input').value.trim();
  if (value) updateProfileField('phonenumber', value);
});

// Change password
document.querySelector('.js-change-password-button').addEventListener('click', () => {
  const value = document.querySelector('.js-password-input').value.trim();
  if (value) updateProfileField('password', value);
});

// Log out
document.querySelector('.js-log-out-button').addEventListener('click', async () => {
  await fetch('/api/user/logout', {
    method: 'POST',
    credentials: 'include',
  });
  window.location.href = 'login.html';
});

// Open chats
document.querySelector('.js-open-chats-button').addEventListener('click', () => {
  window.location.href = 'chats.html';
});