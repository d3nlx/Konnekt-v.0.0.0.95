const { API_BASE_URL, endpoints, routes } = window.CONFIG;

document.querySelector('.js-sign-up-button').addEventListener('click', async () => {
  const name = document.querySelector('.js-first-name').value;
  const displayName = document.querySelector('.js-display-name').value;
  const phonenumber = document.querySelector('.js-phonenumber').value;
  const password = document.querySelector('.js-password-input').value;
  const registrationError = document.querySelector('.registration-error');

  if (!name || !displayName || !phonenumber || !password) {
    registrationError.textContent = 'Заполните все поля';
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoints.register}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, displayName, phonenumber, password })
    });

    if (response.ok) {
      console.log("✅ Успешная регистрация");
      window.location.href = routes.profile;
    } else {
      const errorData = await response.json().catch(() => ({}));
      registrationError.textContent = errorData?.[0]?.msg || errorData.message || 'Ошибка регистрации';
    }
  } catch {
    registrationError.textContent = 'Ошибка соединения с сервером';
  }
});

document.querySelector('.js-log-in-button').addEventListener('click', () => {
  window.location.href = routes.login;
});
