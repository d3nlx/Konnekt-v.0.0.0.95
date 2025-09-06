import express from 'express';
import { Message } from '../models/message.mjs';
import { User } from '../models/user.mjs';

const router = express.Router();

// 📌 ОТПРАВКА СООБЩЕНИЯ (с поддержкой replyTo)
router.post('/', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });

    const { receiverId, message, replyTo, forwardedFrom } = req.body;
    if (!receiverId || !message) {
      return res.status(400).json({ error: 'Receiver and message required' });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

    let replyText = null;
    let replyUser = null;

    if (replyTo) {
      const repliedMsg = await Message.findById(replyTo).populate('sender', 'displayName');
      if (repliedMsg) {
        replyText = repliedMsg.message;
        replyUser = repliedMsg.sender.displayName;
      }
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      message,
      replyTo,
      replyText,
      replyUser,
      forwardedFrom: forwardedFrom || null
    });

    res.status(201).json({
      message: 'Message sent',
      data: {
        id: newMessage._id,
        sender: req.user._id,
        receiver: receiverId,
        message: newMessage.message,
        timestamp: newMessage.timestamp,
        replyTo,
        replyText,
        replyUser,
        forwardedFrom
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
    // если пользователь не авторизован → сразу возвращаем пустые данные
    if (!req.user) {
      return res.json({ pinned: null, messages: [] });
    }

    const contactId = req.params.contactId;

    // достаём все сообщения между текущим пользователем и контактId
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: contactId },
        { sender: contactId, receiver: req.user._id }
      ]
    })
      .sort({ timestamp: 1 })
      .populate('sender', 'displayName');

    // ищем закрепленное сообщение
    const pinned = messages.find(m => m.pinned);

    // отвечаем фронту
    res.json({
      pinned: pinned
        ? {
            id: pinned._id,
            sender: pinned.sender._id,
            senderName: pinned.sender.displayName,
            receiver: pinned.receiver,
            message: pinned.message,
            timestamp: pinned.timestamp
          }
        : null,
      messages: messages.map(msg => ({
        id: msg._id,
        sender: msg.sender._id,
        senderName: msg.sender.displayName,
        receiver: msg.receiver,
        message: msg.message,
        timestamp: msg.timestamp,
        replyTo: msg.replyTo,
        replyText: msg.replyText,
        replyUser: msg.replyUser,
        forwardedFrom: msg.forwardedFrom
      }))
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ error: "Failed to load messages" });
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

// Закрепить сообщение
// 📌 Закрепить сообщение
router.post('/:id/pin', async (req, res) => {
  try {
    const msgId = req.params.id;
    const message = await Message.findById(msgId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    // сначала снимаем пин со всех сообщений в этом чате
    await Message.updateMany(
      {
        $or: [
          { sender: message.sender, receiver: message.receiver },
          { sender: message.receiver, receiver: message.sender }
        ],
        pinned: true
      },
      { $set: { pinned: false } }
    );

    // ставим пин на текущее
    message.pinned = true;
    await message.save();

    res.json({ success: true, message: message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ❌ снять закреп
router.post('/unpin', async (req, res) => {
  try {
    await Message.updateMany({ pinned: true }, { $set: { pinned: false } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;