const Chat = require('../models/Chat');

exports.getChats = async (req, res) => {
  try {
    const chats = await Chat.find({ lawyer: req.lawyer.id, isActive: true })
      .populate('client', 'firstName lastName profilePicture')
      .sort('-lastMessageAt');
    
    res.status(200).json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chats', error: error.message });
  }
};

exports.getChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('client', 'firstName lastName profilePicture')
      .populate('lawyer', 'firstName lastName profilePicture');
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    res.status(200).json({ success: true, chat });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching chat', error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }
    
    const newMessage = {
      sender: req.lawyer.id,
      senderModel: 'Lawyer',
      message,
      messageType: 'text'
    };
    
    chat.messages.push(newMessage);
    chat.unreadCount.client += 1;
    await chat.save();
    
    // Emit socket event
    const io = req.app.get('io');
    io.to(req.params.chatId).emit('receiveMessage', newMessage);
    
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending message', error: error.message });
  }
};

exports.sendFileMessage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }
    
    const chat = await Chat.findById(req.params.chatId);
    
    const newMessage = {
      sender: req.lawyer.id,
      senderModel: 'Lawyer',
      message: 'File attachment',
      messageType: 'file',
      fileUrl: req.file.path,
      fileName: req.file.originalname
    };
    
    chat.messages.push(newMessage);
    chat.unreadCount.client += 1;
    await chat.save();
    
    res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending file', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    chat.unreadCount.lawyer = 0;
    
    // Mark all messages from client as read
    chat.messages.forEach(msg => {
      if (msg.senderModel === 'Client' && !msg.isRead) {
        msg.isRead = true;
        msg.readAt = Date.now();
      }
    });
    
    await chat.save();
    res.status(200).json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error marking messages as read', error: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const chats = await Chat.find({ lawyer: req.lawyer.id, isActive: true });
    const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount.lawyer, 0);
    
    res.status(200).json({ success: true, unreadCount: totalUnread });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching unread count', error: error.message });
  }
};

exports.closeChat = async (req, res) => {
  try {
    await Chat.findByIdAndUpdate(req.params.chatId, { isActive: false });
    res.status(200).json({ success: true, message: 'Chat closed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error closing chat', error: error.message });
  }
};
