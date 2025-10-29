import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // новое поле: было ли сообщение отредактировано
  edited: {
    type: Boolean,
    default: false
  },
  // новое поле: ссылка на сообщение, на которое отвечаем
    replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  replyText: {
    type: String,
    default: null
  },
  replyUser: {
    type: String,
    default: null
  },
  forwardedFrom: { 
    type: String 
  }, // 👈 имя того, кто переслал
  pinned: {
     type: Boolean, default: false 
  },
  read: { type: Boolean, default: false }
});

export const Message = mongoose.model('Message', MessageSchema);
