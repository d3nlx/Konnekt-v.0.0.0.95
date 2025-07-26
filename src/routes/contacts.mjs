import express from 'express'; 
import { Contact } from '../mongoose/schemas/contact.mjs';
import { User } from '../mongoose/schemas/user.mjs';

const router = express.Router();

// GET /api/contacts — Получить список контактов текущего пользователя
router.get('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });
    console.log(req.user)

    const contacts = await Contact.find({ owner: req.user._id }).populate('contact', 'name phonenumber displayName');

    res.json(contacts.map(c => ({
      id: c._id,
      name: c.contact.name,
      phonenumber: c.contact.phonenumber,
      displayName: c.contact.displayName,
    })));
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// POST /api/contacts — Найти пользователя и добавить в контакты
router.post('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });

    const { query } = req.body; // query может быть номер или displayName

    if (!query) {
      return res.status(400).json({ error: 'No search query provided' });
    }

    // Поиск по номеру или displayName
    let foundUser;

    if (!isNaN(query)) {
      // если query — это число или строка, которую можно превратить в число
      foundUser = await User.findOne({ phonenumber: Number(query) });
    } else {
      // если это текст — ищем по displayName
      foundUser = await User.findOne({ displayName: query });
    }

    if (!foundUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Нельзя добавить себя в контакты
    if (foundUser._id.equals(req.user._id)) {
      return res.status(400).json({ error: 'You cannot add yourself' });
    }

    // Проверим, уже ли контакт есть
    const alreadyContact = await Contact.findOne({
      owner: req.user._id,
      contact: foundUser._id,
    });

    if (alreadyContact) {
      return res.status(400).json({ error: 'User already in contacts' });
    }

    // Добавим нового контакта
    const newContact = await Contact.create({
      owner: req.user._id,
      contact: foundUser._id,
    });

    res.status(201).json({
      message: 'Contact added successfully',
      contact: {
        id: newContact._id,
        name: foundUser.name,
        phonenumber: foundUser.phonenumber,
        displayName: foundUser.displayName,
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// DELETE /api/contacts/:id — Удалить контакт по ID
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });

    const contactId = req.params.id;

    const contact = await Contact.findOne({
      _id: contactId,
      owner: req.user._id
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    await Contact.deleteOne({ _id: contactId });

    res.json({ message: 'Contact deleted successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;