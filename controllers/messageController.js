const Message = require('../models/Message');
const User = require('../models/User');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, productId, content } = req.body;

    if (!receiverId || !productId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    if (receiverId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Không thể nhắn tin cho chính mình'
      });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      product: productId,
      content
    });

    await message.populate('sender', 'name avatar');
    await message.populate('receiver', 'name avatar');

    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/messages/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get unique conversations
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }]
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            product: '$product',
            otherUser: {
              $cond: [{ $eq: ['$sender', userId] }, '$receiver', '$sender']
            }
          },
          lastMessage: { $first: '$content' },
          lastDate: { $first: '$createdAt' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] },
                1, 0
              ]
            }
          }
        }
      },
      { $sort: { lastDate: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: '_id.otherUser',
          foreignField: '_id',
          as: 'otherUser'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$otherUser' },
      { $unwind: '$product' },
      {
        $project: {
          otherUser: { _id: 1, name: 1, avatar: 1 },
          product: { _id: 1, title: 1, price: 1, images: 1 },
          lastMessage: 1,
          lastDate: 1,
          unreadCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get messages between two users about a product
// @route   GET /api/messages/:userId/:productId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
      product: productId,
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark as read
    await Message.updateMany(
      {
        product: productId,
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false
    });
    res.json({ success: true, count });
  } catch (e) {
    res.json({ success: true, count: 0 });
  }
};
