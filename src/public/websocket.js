const socket = io(); // подключение по умолчанию к серверу

socket.on('connect', () => {
  console.log('🔌 Подключено к серверу');
});

socket.on('disconnect', () => {
  console.log('❌ Отключено от сервера');
});

socket.on('new_message', (data) => {
  console.log('📩 Новое сообщение:', data);
});
