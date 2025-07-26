import express from 'express'; 
import routes from './routes/index.mjs';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
import path from 'path';
import { fileURLToPath } from 'url';
import "./strategies/local-strategy.mjs";

import contactsRoutes from './routes/contacts.mjs';

import messagesRouter from './routes/messages.mjs';

const app = express();

// Получаем путь к текущей директории (чтобы работал import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Подключаем статику — теперь ты можешь заходить на registration.html
app.use(express.static(path.join(__dirname, 'public')));

// Подключаемся к MongoDB
mongoose.connect("mongodb://localhost/konnekt_exp")
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log(`Error: ${err}`));

// Для парсинга JSON тела запроса
app.use(express.json());

// Настройка session + cookie
app.use(session({
  secret: 'anson the dev', // любой секрет
  saveUninitialized: false,
  resave: false,
  rolling: true, // обновлять срок действия cookie при каждом запросе
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30 дней
    httpOnly: true,
  },
  store: MongoStore.create({
    client: mongoose.connection.getClient()
  })
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(routes);

app.use('/api/contacts', contactsRoutes); 

app.use('/api/messages', messagesRouter);

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Running on Port ${PORT}`);
});