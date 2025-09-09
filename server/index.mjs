import dotenv from 'dotenv';
import cors from 'cors';
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

import { Message } from './models/message.mjs'; // 👈 твоя модель сообщений
import { User } from './models/user.mjs'; // 👈 пригодится для displayName

dotenv.config();

const app = express();
const server = http.createServer(app);

// 👇 разрешённые источники (укажи свои)
const ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://d3nlx.github.io',
  'https://d3nlx.github.io/Konnekt-v.0.0.0.95'
];

app.set('trust proxy', 1);

// CORS для REST
app.use(cors({
  origin: ORIGINS,
  credentials: true
}));

const io = new Server(server, {
  cors: { origin: ORIGINS, credentials: true }
});
app.set('io', io);

// Пути
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Подключено к MongoDB Atlas');

// Middleware
app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Роуты
app.use(routes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/messages', messagesRouter);

// Сессия в сокетах
io.use(sharedSession(sessionMiddleware, { autoSave: true }));

io.on('connection', (socket) => {
  const userId = socket.handshake.session?.passport?.user;
  if (!userId) return socket.disconnect();

  socket.join(userId);
  console.log(`🔌 Пользователь ${userId} подключился`);

  // 📩 Отправка сообщения
  socket.on('send_message', async ({ to, message, replyTo, forwardedFrom }) => {
    try {
      const from = userId;
      const sender = await User.findById(from).lean();

      // сохраняем в MongoDB
      const msgDoc = await Message.create({
        sender: from,
        receiver: to,
        message,
        replyTo,
        forwardedFrom,
        timestamp: Date.now()
      });

      const payload = {
        id: msgDoc._id.toString(),
        from,
        to,
        message,
        timestamp: msgDoc.timestamp,
        replyTo,
        forwardedFrom,
        senderName: sender.displayName || sender.name || "User"
      };

      // рассылаем обеим сторонам
      io.to(to).emit('new_message', payload);
      io.to(from).emit('new_message', payload);

      // добавляем в контакты получателю
      io.to(to).emit('contact_added', { from });
    } catch (err) {
      console.error("Ошибка при отправке сообщения:", err);
    }
  });

  // 📝 Редактирование сообщения
  socket.on('edit_message', async ({ id, newText }) => {
    try {
      const msg = await Message.findOneAndUpdate(
        { _id: id, sender: userId },
        { message: newText, edited: true },
        { new: true }
      );

      if (msg) {
        const payload = {
          id: msg._id.toString(),
          message: msg.message,
          timestamp: msg.timestamp
        };
        io.to(msg.receiver.toString()).emit('message_edited', payload);
        io.to(userId).emit('message_edited', payload);
      }
    } catch (err) {
      console.error("Ошибка при редактировании:", err);
    }
  });

  // ❌ Удаление сообщений
  socket.on('delete_message', async ({ to, ids }) => {
    try {
      await Message.deleteMany({
        _id: { $in: ids },
        $or: [
          { sender: userId },
          { receiver: userId }
        ]
      });

      io.to(to).emit('messages_deleted', { ids });
      io.to(userId).emit('messages_deleted', { ids });
    } catch (err) {
      console.error("Ошибка при удалении:", err);
    }
  });

  // 📌 Закрепление
  socket.on('pin_message', async ({ chatId, messageId }) => {
    try {
      await Message.updateMany(
        { chatId },
        { $set: { pinned: false } }
      );
      await Message.findByIdAndUpdate(messageId, { pinned: true });

      io.to(chatId).emit('message_pinned', { messageId });
    } catch (err) {
      console.error("Ошибка при закреплении:", err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Пользователь ${userId} отключился`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер + сокеты запущены на http://localhost:${PORT}`);
});


/*
 Обновить серверный файл что бы все работало с сокетами
*/