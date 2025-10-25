import express from "express";
import { User } from "../models/user.mjs";

const router = express.Router();

// ✅ вернуть только контакты текущего юзера
router.get("/", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const me = await User.findById(req.user._id).populate("contacts", "displayName phone");
    if (!me) return res.status(404).json({ error: "User not found" });

    // 🧩 убираем возможные дубликаты перед отправкой клиенту
    const unique = new Map();
    for (const c of me.contacts) {
      unique.set(c._id.toString(), {
        id: c._id.toString(),
        displayName: c.displayName || c.username || c.phone || "Без имени"
      });
    }

    res.json([...unique.values()]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load contacts" });
  }
});

// ✅ добавить нового контакта (по ID или по имени/телефону)
router.post("/", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const { id, query } = req.body;
    let user;

    if (id) {
      user = await User.findById(id);
    } else if (query) {
      user = await User.findOne({
        $or: [{ displayName: query }, { phone: query }]
      });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    // 🔒 защита от добавления самого себя
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot add yourself" });
    }

    const me = await User.findById(req.user._id);

    // 🧩 проверяем — уже есть этот контакт?
    const already = me.contacts.some(c => c.toString() === user._id.toString());
    if (already) {
      return res.status(200).json({
        message: "Contact already exists",
        id: user._id.toString(),
        displayName: user.displayName
      });
    }

    // если нет — добавляем
    me.contacts.push(user._id);
    await me.save();

    res.json({ id: user._id.toString(), displayName: user.displayName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add contact" });
  }
});

export default router;
