import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import sharedSession from 'express-socket.io-session';
import sessionMiddleware from './session.js';

import routes from './routes/index.mjs';
import contactsRoutes from './routes/contacts.mjs';
import messagesRouter from './routes/messages.mjs';
import './strategies/local-strategy.mjs';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Для пути
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MongoDB
await mongoose.connect("mongodb://localhost/konnekt_exp");
console.log("✅ Подключено к MongoDB");

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Роуты
app.use(routes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/messages', messagesRouter);

// Привязка сессии к Socket.IO
io.use(sharedSession(sessionMiddleware, { autoSave: true }));

// Сокеты
io.on('connection', (socket) => {
  const userId = socket.handshake.session?.passport?.user;
  if (!userId) {
    console.log('❌ Гость не допущен к сокету');
    socket.disconnect();
    return;
  }

  console.log('🔌 Пользователь подключен к сокету:', userId);
  socket.join(userId); // Подключение к своей комнате

  // Получение и отправка сообщений
  socket.on('send_message', (data) => {
    const { to, message } = data;

    // Отправка только конкретному получателю
    io.to(to).emit('new_message', {
      from: userId,
      message,
    });
  });
});

// Старт сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер + сокеты запущены на http://localhost:${PORT}`);
});