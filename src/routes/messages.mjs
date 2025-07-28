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

router.get('/:contactId', async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not logged in' });

    const contactId = req.params.contactId;

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: contactId },
        { sender: contactId, receiver: req.user._id }
      ]
    }).sort({ timestamp: 1 }); // по возрастанию

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


export default router;