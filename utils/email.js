const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

// new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'noreply@natours.com';
  }

  createNewTransport() {
    if (process.env.NODE_ENV == 'production') {
      //sendGrid
      return nodemailer.createTransport({
        host: process.env.BREVO_SMTP_HOST,
        port: process.env.BREVO_SMTP_PORT,
        auth: {
          user: process.env.BREVO_SMTP_USERNAME,
          pass: process.env.BREVO_SMTP_PASSWORD
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
      // Activate in gmail "less secure app" option
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert(html)
    };

    // 3) Use the transporter to send the email
    const transporter = this.createNewTransport();
    await transporter.sendMail(mailOptions, err => {
      if (err) console.error('Error sending email', err);
      else console.log('Email sent!');
    });
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPassowordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }
};

// const sendEmail = async options => {
//   // 1) Create a transporter
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USERNAME,
//       pass: process.env.EMAIL_PASSWORD
//     }
//     // Activate in gmail "less secure app" option
//   });
//   // 2) Define the email options
//   const mailOptions = {
//     from: 'noreply@natours.com',
//     to: options.to,
//     subject: options.subject,
//     text: options.message
//   };

//   // 3) Actually send the email
//   await transporter.sendMail(mailOptions);
// };

// module.exports = sendEmail;
