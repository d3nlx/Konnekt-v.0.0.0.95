document.querySelector('.js-log-in-button').addEventListener('click', async () => {
  const phonenumber = document.querySelector('.js-number-input-login').value;
  const password = document.querySelector('.js-password-input-login').value;
  const loginError = document.querySelector('.login-error');

  if (!phonenumber || !password) {
    loginError.textContent = 'Заполните все поля';
    return;
  }

  try {
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ phonenumber, password })
    });

    if (response.ok) {
      console.log("u registred")
      window.location.href = 'profile.html';
    } else {
      const errorData = await response.json();
      loginError.textContent = errorData.message || 'Ошибка входа';
    }
  } catch (error) {
    loginError.textContent = 'Ошибка соединения с сервером';
  }
});

document.querySelector('.js-sign-up-button').addEventListener('click', () => {
  window.location.href = 'registration.html';
});