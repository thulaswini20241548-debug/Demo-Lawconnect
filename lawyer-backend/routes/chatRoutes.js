const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/chat
// @desc    Get all chats for logged in lawyer
// @access  Private (Lawyer only)
router.get('/', protect, chatController.getChats);

// @route   GET /api/chat/:chatId
// @desc    Get single chat with messages
// @access  Private
router.get('/:chatId', protect, chatController.getChat);

// @route   POST /api/chat/:chatId/messages
// @desc    Send a message
// @access  Private
router.post('/:chatId/messages', protect, chatController.sendMessage);

// @route   POST /api/chat/:chatId/messages/file
// @desc    Send a file message
// @access  Private
router.post(
  '/:chatId/messages/file',
  protect,
  upload.single('file'),
  chatController.sendFileMessage
);

// @route   PUT /api/chat/:chatId/read
// @desc    Mark messages as read
// @access  Private
router.put('/:chatId/read', protect, chatController.markAsRead);

// @route   GET /api/chat/unread/count
// @desc    Get unread message count
// @access  Private (Lawyer only)
router.get('/unread/count', protect, chatController.getUnreadCount);

// @route   DELETE /api/chat/:chatId
// @desc    Close/archive a chat
// @access  Private (Lawyer only)
router.delete('/:chatId', protect, chatController.closeChat);

module.exports = router;
