import express from "express";
import { User } from "../mongoose/schemas/user.mjs";

const router = express.Router();

// ✅ вернуть только контакты текущего юзера
router.get("/", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const me = await User.findById(req.user._id).populate("contacts", "displayName phone");
    if (!me) return res.status(404).json({ error: "User not found" });

    res.json(
      me.contacts.map(c => ({
        id: c._id.toString(),
        displayName: c.displayName || c.username || c.phone || "Без имени"
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load contacts" });
  }
});

// ✅ добавить нового контакта (по имени или телефону)
router.post("/", async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not logged in" });

    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query required" });

    // ищем по displayName или phone
    const user = await User.findOne({
      $or: [{ displayName: query }, { phone: query }]
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    // добавляем только если ещё нет
    const me = await User.findById(req.user._id);
    if (!me.contacts.includes(user._id)) {
      me.contacts.push(user._id);
      await me.save();
    }

    res.json({
      id: user._id.toString(),
      displayName: user.displayName || user.username || user.phone
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add contact" });
  }
});

export default router;