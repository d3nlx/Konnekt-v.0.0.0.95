import { Router } from "express";
import { User } from '../models/user.mjs'; // поправь путь, если надо

const router = Router();

// GET /api/user/:id — получить данные пользователя по ID
// routes/user.js
router.get('/api/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('displayName name phonenumber');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Ошибка в /api/users/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


export default router;
