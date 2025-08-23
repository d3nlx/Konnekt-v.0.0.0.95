import express from 'express';
import { Message } from '../mongoose/schemas/message.mjs';
import { User } from '../mongoose/schemas/user.mjs';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });

    const { receiverId, message } = req.body;

    if (!receiverId || !message) {
      return res.status(400).json({ error: 'Receiver and message required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
    });

    res.status(201).json({
      message: 'Message sent',
      data: {
        id: newMessage._id,
        sender: req.user._id,
        receiver: receiverId,
        message: newMessage.message,
        timestamp: newMessage.timestamp
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});


// ✅ Получение сообщений (с поддержкой ?limit=N)
router.get('/:contactId', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });

    const contactId = req.params.contactId;
    const limit = parseInt(req.query.limit, 10) || 0; // если нет ?limit=, то 0 (без лимита)

    const query = Message.find({
      $or: [
        { sender: req.user._id, receiver: contactId },
        { sender: contactId, receiver: req.user._id }
      ]
    }).sort({ timestamp: -1 }); // последние сверху

    if (limit > 0) {
      query.limit(limit);
    }

    let messages = await query;

    // так как сортировка -1 (от новых к старым), переворачиваем, чтобы вернуть в порядке от старых к новым
    messages = messages.reverse();

    res.json(messages.map(msg => ({
      id: msg._id,
      sender: msg.sender,
      receiver: msg.receiver,
      message: msg.message,
      timestamp: msg.timestamp
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Удаление сообщения по ID
router.delete('/:id', async (req, res) => {
  const messageId = req.params.id;

  try {
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // ❌ Проверку убираем — теперь можно удалять любые сообщения
    await message.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Редактирование сообщения по ID
router.put('/:id', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });

    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message text required' });
    }

    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });

    // проверяем автора
    if (msg.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    msg.message = message;
    await msg.save();

    // ⚡ уведомим через socket.io (получаем io из app)
    req.app.get('io').to(msg.receiver.toString()).emit('message_edited', {
      id: msg._id,
      message: msg.message,
      timestamp: msg.timestamp,
    });

    res.json({
      success: true,
      data: {
        id: msg._id,
        sender: msg.sender,
        receiver: msg.receiver,
        message: msg.message,
        timestamp: msg.timestamp,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;