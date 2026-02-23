const express  = require('express');
const { body, validationResult } = require('express-validator');
const router   = express.Router();
const Message  = require('../models/Message');
const { sendNotificationEmail, sendAutoReply } = require('../services/emailService');

// ── Validation rules ──────────────────────────────────────────
const contactValidation = [
  body('firstName')
    .trim().notEmpty().withMessage('First name is required.')
    .isLength({ max: 60 }).withMessage('First name too long.'),

  body('lastName')
    .trim().notEmpty().withMessage('Last name is required.')
    .isLength({ max: 60 }).withMessage('Last name too long.'),

  body('email')
    .trim().notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('enquiryType')
    .notEmpty().withMessage('Enquiry type is required.')
    .isIn(['Job Opportunity', 'Freelance Project', 'Internship', 'General Enquiry'])
    .withMessage('Invalid enquiry type.'),

  body('message')
    .trim().notEmpty().withMessage('Message is required.')
    .isLength({ min: 10, max: 3000 })
    .withMessage('Message must be between 10 and 3000 characters.'),
];

// ── POST /api/contact ─────────────────────────────────────────
// Submit a contact form message
router.post('/', contactValidation, async (req, res) => {
  // 1. Check validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed.',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }

  const { firstName, lastName, email, enquiryType, message } = req.body;

  try {
    // 2. Save message to database
    const saved = await Message.create({
      firstName,
      lastName,
      email,
      enquiryType,
      message,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // 3. Send notification email to Victor
   // 3. Send emails (non-blocking — message is saved even if email fails)
    try {
      await sendNotificationEmail({ firstName, lastName, email, enquiryType, message });
      await sendAutoReply({ firstName, email });
    } catch (emailErr) {
      console.error('Email sending failed (message still saved):', emailErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `Thanks ${firstName}! Your message has been received. I'll get back to you within 24 hours.`,
      id:      saved._id,
    });

  } catch (err) {
    console.error('Contact form error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong sending your message. Please try again or email directly.',
    });
  }
});

module.exports = router;
