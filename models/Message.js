const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    firstName:   { type: String, required: true, trim: true, maxlength: 60 },
    lastName:    { type: String, required: true, trim: true, maxlength: 60 },
    email:       { type: String, required: true, trim: true, lowercase: true },
    enquiryType: { type: String, required: true, enum: ['Job Opportunity', 'Freelance Project', 'Internship', 'General Enquiry'] },
    message:     { type: String, required: true, trim: true, maxlength: 3000 },
    status:      { type: String, enum: ['unread', 'read', 'replied'], default: 'unread' },
    ipAddress:   { type: String },
    userAgent:   { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
