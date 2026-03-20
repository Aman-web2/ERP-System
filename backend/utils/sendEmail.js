const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const hasSmtpConfig = process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS;

  const transporter = hasSmtpConfig
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: Boolean(process.env.EMAIL_SECURE === 'true'),
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      })
    : nodemailer.createTransport({
        jsonTransport: true
      });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'ERP Admin <noreply@erp.com>',
    to: options.email,
    subject: options.subject,
    text: options.message
  };

  const info = await transporter.sendMail(mailOptions);

  if (!hasSmtpConfig) {
    console.log('Email transport fallback payload:', info.message);
  }
};

module.exports = sendEmail;

