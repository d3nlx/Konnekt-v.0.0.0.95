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

  const response = await fetch('/api/users/registration', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name,
      displayName,
      phonenumber,
      password
    }),
    credentials: 'include'
  });

  if (response.ok) {
    console.log("u registred")
    window.location.href = '/profile.html';
  } else {
    const errorData = await response.json().catch(() => ({}));
    registrationError.textContent = errorData?.[0]?.msg || 'Ошибка регистрации';
  }
});

document.querySelector('.js-log-in-button').addEventListener('click', () => {
  window.location.href = 'login.html';
});