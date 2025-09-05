import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId, // Кто добавил в контакты
    ref: 'User',
    required: true
  },
  contact: {
    type: mongoose.Schema.Types.ObjectId, // Кого добавили
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Чтобы один и тот же контакт не добавлялся дважды:
ContactSchema.index({ owner: 1, contact: 1 }, { unique: true });

export const Contact = mongoose.model('Contact', ContactSchema);
