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
import sessionMiddleware from './session.js'; // проверь путь

import routes from './routes/index.mjs';
import contactsRoutes from './routes/contacts.mjs';
import messagesRouter from './routes/messages.mjs';
import './strategies/local-strategy.mjs';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 👇 Задай свои домены:
const ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://<ТВОЙ_логин>.github.io',
  'https://<ТВОЙ_логин>.github.io/<ТВОЙ_репозиторий>',
];

app.set('trust proxy', 1); // нужно для secure cookies за прокси (Render)

// CORS для REST
app.use(cors({
  origin: ORIGINS,
  credentials: true
}));

const io = new Server(server, {
  cors: { origin: ORIGINS, credentials: true }
});
app.set('io', io);

// пути
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// MongoDB
await mongoose.connect(process.env.MONGO_URI);
console.log('✅ Подключено к MongoDB Atlas');

// middleware
app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// роуты
app.use(routes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/messages', messagesRouter);

// сессия в сокетах
io.use(sharedSession(sessionMiddleware, { autoSave: true }));

io.on('connection', (socket) => {
  const userId = socket.handshake.session?.passport?.user;
  if (!userId) return socket.disconnect();

  socket.join(userId);

  socket.on('send_message', (data) => {
    const { to } = data;
    const payload = { ...data, from: userId };
    io.to(to).emit('new_message', payload);
    io.to(userId).emit('new_message', payload);
    io.to(to).emit('contact_added', { from: userId });
  });

  socket.on('delete_message', ({ to, ids }) => {
    io.to(to).emit('messages_deleted', { ids });
    io.to(userId).emit('messages_deleted', { ids });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Сервер + сокеты запущены на http://localhost:${PORT}`);
});