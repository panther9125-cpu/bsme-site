const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());

// 1. Setup the Email Sender
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kevinewasiuk1@gmail.com', 
    pass: process.env.GMAIL_PASS // Uses the variable you set in Render
  }
});

// 2. Verification Route
app.get('/verify-page', (req, res) => {
  res.send('<h1>Email Verified!</h1><p>You can now log in to the Kitten Forum.</p>');
});

// 3. Simple Test Route
app.get('/', (req, res) => {
  res.send('Kitten Forum is Running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
