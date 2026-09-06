const express = require('express');
const router = express.Router();
const sendEmail = require('../utils/sendEmail');

router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Send email to admin/owner
    await sendEmail({
      email: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER,
      subject: `[BizeeERP Contact] ${subject}`,
      message: `New contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    // Send confirmation to the person who filled the form
    await sendEmail({
      email: email,   // jis ne form bhara uski email
      subject: 'We received your message — BizeeERP',
      message: `Hi ${name},\n\nThank you for reaching out! We have received your message and will get back to you shortly.\n\nYour message:\n"${message}"\n\nBest regards,\nBizeeERP Team`,
    });

    res.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact email error:', error);
    res.status(500).json({ message: 'Failed to send message. Please try again.' });
  }
});

module.exports = router;
