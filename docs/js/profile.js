const { API_BASE_URL, endpoints, routes } = window.CONFIG;

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoints.profile}`, {
      credentials: 'include',
    });

    if (!res.ok) {
      window.location.href = routes.login;
      return;
    }

    const user = await res.json();
    document.querySelector('.js-name').textContent = user.name;
    document.querySelector('.js-display-name').textContent = user.displayName;
    document.querySelector('.js-phonenumber').textContent = user.phonenumber;
  } catch (err) {
    console.error('Error loading profile', err);
    window.location.href = routes.login;
  }
});

// Log out
document.querySelector('.js-log-out-button').addEventListener('click', async () => {
  await fetch(`${API_BASE_URL}${endpoints.logout}`, {
    method: 'POST',
    credentials: 'include',
  });
  window.location.href = routes.login;
});

// Open chats
document.querySelector('.js-open-chats-button').addEventListener('click', () => {
  window.location.href = routes.chats;
});

document.querySelector('.menu-pencil').addEventListener('click', () => {
  window.location.href = routes.editProfile;
});
