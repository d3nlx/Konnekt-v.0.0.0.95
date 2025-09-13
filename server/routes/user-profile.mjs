import { Router } from "express";
import bcrypt from 'bcrypt';
import { User } from '../models/user.mjs';

const router = Router();

router.get('/', (req, res) => {
  if (!req.user) {
    return res.status(401).send({ msg: 'Not authenticated' });
  }

  res.send({
    _id: req.user._id,
    name: req.user.name,
    phonenumber: req.user.phonenumber,
    displayName: req.user.displayName,
    password: req.user.password  // <-- убрать перед продакшеном
  });
});

router.patch('/', async (req, res) => {
  if (!req.user) return res.sendStatus(401);

  const { name, displayName, phonenumber, password } = req.body;

  if (name) req.user.name = name;
  if (displayName) req.user.displayName = displayName;
  if (phonenumber) req.user.phonenumber = String(phonenumber);

  if (password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    req.user.password = hashedPassword;
  }

  try {
    await req.user.save();
    res.sendStatus(200);
  } catch (err) {
    // Обработка ошибок дубликатов (MongoDB error code 11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(409).send({ error: `${field} already taken` });
    }

    // Все прочие ошибки
    console.error('Ошибка при обновлении профиля:', err);
    res.sendStatus(500);
  }
});


export default router;