const express = require('express');
const jwt     = require('jsonwebtoken');
const router  = express.Router();
const Admin   = require('../models/Admin');
const Message = require('../models/Message');
const auth    = require('../middleware/auth');

// ── POST /api/admin/login ─────────────────────────────────────
// Login with username + password, receive JWT
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required.' });
  }

  try {
    // Find admin by username
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Verify password
    const match = await admin.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Sign JWT (expires in 8 hours)
    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.json({ success: true, token, username: admin.username });

  } catch (err) {
    console.error('Admin login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/admin/messages ───────────────────────────────────
// Get all messages, with optional filters (protected)
router.get('/messages', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Message.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).lean(),
      Message.countDocuments(filter),
    ]);

    // Count unread
    const unread = await Message.countDocuments({ status: 'unread' });

    return res.json({
      success: true,
      data: {
        messages,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
        unread,
      },
    });
  } catch (err) {
    console.error('Get messages error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/admin/messages/:id ───────────────────────────────
// Get a single message and mark as read (protected)
router.get('/messages/:id', auth, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });

    // Auto-mark as read when opened
    if (msg.status === 'unread') {
      msg.status = 'read';
      await msg.save();
    }

    return res.json({ success: true, data: msg });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── PATCH /api/admin/messages/:id ────────────────────────────
// Update message status (unread / read / replied) (protected)
router.patch('/messages/:id', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['unread', 'read', 'replied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });

    return res.json({ success: true, data: msg });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── DELETE /api/admin/messages/:id ───────────────────────────
// Delete a message (protected)
router.delete('/messages/:id', auth, async (req, res) => {
  try {
    const msg = await Message.findByIdAndDelete(req.params.id);
    if (!msg) return res.status(404).json({ success: false, message: 'Message not found.' });

    return res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── GET /api/admin/stats ──────────────────────────────────────
// Dashboard summary stats (protected)
router.get('/stats', auth, async (req, res) => {
  try {
    const [total, unread, read, replied, byType] = await Promise.all([
      Message.countDocuments(),
      Message.countDocuments({ status: 'unread' }),
      Message.countDocuments({ status: 'read' }),
      Message.countDocuments({ status: 'replied' }),
      Message.aggregate([
        { $group: { _id: '$enquiryType', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
    ]);

    // Messages in the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recent  = await Message.countDocuments({ createdAt: { $gte: weekAgo } });

    return res.json({
      success: true,
      data: { total, unread, read, replied, recent, byType },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;
