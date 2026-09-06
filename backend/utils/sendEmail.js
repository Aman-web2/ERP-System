const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const hasSmtpConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

  const transporter = hasSmtpConfig
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      })
    : nodemailer.createTransport({ jsonTransport: true });

  const mailOptions = {
    from: `"BizeeERP" <${process.env.EMAIL_USER || 'noreply@erp.com'}>`,
    to: options.email,   // yahi woh email hai jo form mein type ki gayi
    subject: options.subject,
    text: options.message,
    ...(options.html && { html: options.html }),
  };

  const info = await transporter.sendMail(mailOptions);

  if (!hasSmtpConfig) {
    console.log('Email fallback payload:', info.message);
  }
};

module.exports = sendEmail;
