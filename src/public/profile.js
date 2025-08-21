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
  } catch (err) {
    console.error('Error loading profile', err);
    window.location.href = 'login.html';
  }
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
  window.location.href = 'chating.html';
});

document.querySelector('.menu-pencil').addEventListener('click', () => {
  window.location.href = 'profile-change-info.html'
})