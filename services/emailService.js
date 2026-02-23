const nodemailer = require('nodemailer');

// Create reusable transporter (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

/**
 * Send notification email to Victor when a new message arrives
 */
async function sendNotificationEmail(data) {
  const { firstName, lastName, email, enquiryType, message } = data;

  await transporter.sendMail({
    from:    `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    to:      process.env.EMAIL_TO,
    subject: `[Portfolio] New ${enquiryType} from ${firstName} ${lastName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f7f6f2;border-radius:8px;overflow:hidden;">
        <div style="background:#0a2540;padding:28px 32px;">
          <h2 style="color:#fff;margin:0;font-size:1.2rem;font-weight:500;">New Message — Victor Maingi Portfolio</h2>
        </div>
        <div style="padding:32px;background:#fff;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px 0;font-size:0.8rem;color:#9a9a90;text-transform:uppercase;letter-spacing:0.08em;width:140px;">Name</td>
                <td style="padding:8px 0;font-size:0.95rem;color:#0c0d0a;">${firstName} ${lastName}</td></tr>
            <tr><td style="padding:8px 0;font-size:0.8rem;color:#9a9a90;text-transform:uppercase;letter-spacing:0.08em;">Email</td>
                <td style="padding:8px 0;"><a href="mailto:${email}" style="color:#1a56db;">${email}</a></td></tr>
            <tr><td style="padding:8px 0;font-size:0.8rem;color:#9a9a90;text-transform:uppercase;letter-spacing:0.08em;">Enquiry</td>
                <td style="padding:8px 0;font-size:0.95rem;color:#0c0d0a;">${enquiryType}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e3e1d9;margin:20px 0;"/>
          <p style="font-size:0.8rem;color:#9a9a90;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Message</p>
          <p style="font-size:0.97rem;color:#58584f;line-height:1.7;white-space:pre-wrap;">${message}</p>
        </div>
        <div style="padding:16px 32px;background:#f7f6f2;text-align:center;">
          <p style="font-size:0.75rem;color:#9a9a90;margin:0;">Sent from your portfolio contact form</p>
        </div>
      </div>
    `,
  });
}

/**
 * Send auto-reply confirmation to the person who submitted the form
 */
async function sendAutoReply(data) {
  const { firstName, email } = data;

  await transporter.sendMail({
    from:    `"Victor Maingi" <${process.env.EMAIL_USER}>`,
    to:      email,
    subject: `Thanks for reaching out, ${firstName}!`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f7f6f2;border-radius:8px;overflow:hidden;">
        <div style="background:#0a2540;padding:28px 32px;">
          <h2 style="color:#fff;margin:0;font-size:1.2rem;font-weight:500;">Victor Maingi Katisya</h2>
          <p style="color:rgba(255,255,255,0.5);font-size:0.75rem;letter-spacing:0.1em;text-transform:uppercase;margin:4px 0 0;">IT Professional &amp; Developer · Nairobi, Kenya</p>
        </div>
        <div style="padding:32px;background:#fff;">
          <p style="font-size:1rem;color:#0c0d0a;">Hi ${firstName},</p>
          <p style="font-size:0.97rem;color:#58584f;line-height:1.8;">Thank you for getting in touch! I've received your message and will get back to you within <strong>24 hours</strong>.</p>
          <p style="font-size:0.97rem;color:#58584f;line-height:1.8;">In the meantime, feel free to connect with me on LinkedIn or check out my GitHub.</p>
          <div style="margin:28px 0;display:flex;gap:12px;">
            <a href="https://github.com/vicyvictor" style="display:inline-block;background:#0a2540;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:0.8rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;">GitHub</a>
            <a href="https://www.linkedin.com/in/victor-m-0b757a23b" style="display:inline-block;background:#1a56db;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-size:0.8rem;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-left:10px;">LinkedIn</a>
          </div>
          <p style="font-size:0.97rem;color:#58584f;">Best regards,<br/><strong>Victor Maingi Katisya</strong></p>
        </div>
        <div style="padding:16px 32px;background:#f7f6f2;text-align:center;">
          <p style="font-size:0.75rem;color:#9a9a90;margin:0;">victormaingi44@gmail.com · +254 115 054 657</p>
        </div>
      </div>
    `,
  });
}

module.exports = { sendNotificationEmail, sendAutoReply };
