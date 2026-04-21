/* ═══════════════════════════════════════════════════════════
   Arvind Rai — Contact Routes
   POST /api/contact — Receive contact form submissions
   ═══════════════════════════════════════════════════════════ */

const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// ── POST /api/contact ──
router.post('/contact', async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  console.log(`✦ Contact form: ${name} <${email}> — ${subject}`);

  // Try sending email via Nodemailer (optional — works if SMTP credentials are set)
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const astrologerEmail = process.env.ASTROLOGER_EMAIL;

  if (emailUser && emailPass && astrologerEmail) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });

      await transporter.sendMail({
        from: emailUser,
        to: astrologerEmail,
        subject: `New Website Enquiry: ${subject}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\n\nMessage:\n${message}`,
        replyTo: email
      });

      console.log('✦ Contact email sent to', astrologerEmail);
    } catch (err) {
      console.error('Email send failed:', err.message);
      // Don't fail the request — log and continue
    }
  }

  res.json({ success: true, message: 'Contact form received.' });
});

module.exports = router;
