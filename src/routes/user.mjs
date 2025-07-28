import { Router } from "express";
import { User } from '../mongoose/schemas/user.mjs'; // поправь путь, если надо

const router = Router();

// GET /api/user/:id — получить данные пользователя по ID
router.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name phonenumber displayName');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Ошибка в /api/user/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
