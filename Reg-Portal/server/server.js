const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const PORT = 3000;

// Serve static files from NSA root directory
app.use(express.static(path.join(__dirname, '..')));

const DATA_FILE = path.join(__dirname, 'registrations.json');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Allow CORS for local frontend
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// POST /register - save registration
app.post('/register', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  let registrations = [];
  if (fs.existsSync(DATA_FILE)) {
    registrations = JSON.parse(fs.readFileSync(DATA_FILE));
  }
  registrations.push({ name, email, phone });
  fs.writeFileSync(DATA_FILE, JSON.stringify(registrations, null, 2));
  res.json({ success: true });
});

// GET /registrations - get all registrations
app.get('/registrations', (req, res) => {
  let registrations = [];
  if (fs.existsSync(DATA_FILE)) {
    registrations = JSON.parse(fs.readFileSync(DATA_FILE));
  }
  res.json(registrations);
});

// POST /send-verification-code - send verification code to email
app.post('/send-verification-code', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // Generate a 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // Create a Nodemailer transporter using your email service details
  // IMPORTANT: Replace with your actual email service credentials
  const transporter = nodemailer.createTransport({
    service: 'gmail', // e.g., 'gmail', 'outlook', or a custom SMTP server
    auth: {
      user: 'your_email@example.com', // Your email address
      pass: 'your_email_password'   // Your email password or app-specific password
    }
  });

  const mailOptions = {
    from: 'your_email@example.com', // Sender address
    to: email,                       // Recipient address
    subject: 'Your Verification Code',
    html: `<p>Your verification code is: <b>${verificationCode}</b></p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification code sent to ${email}: ${verificationCode}`);
    res.json({ success: true, message: 'Verification code sent successfully!' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ success: false, error: 'Failed to send verification code.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
