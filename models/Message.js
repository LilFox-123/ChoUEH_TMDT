const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
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
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Tin nhắn không được trống'],
    trim: true,
    maxlength: [1000, 'Tin nhắn không quá 1000 ký tự']
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

messageSchema.index({ sender: 1, receiver: 1, product: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
