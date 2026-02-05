const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.urlencoded({ extended: true })); // This helps the server read form data

// 1. Setup the Email Sender
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kevinewasiuk1@gmail.com', 
    pass: process.env.GMAIL_PASS 
  }
});

// 2. The Homepage (Now with a Signup Form!)
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; max-width: 400px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px;">
      <h2>🐱 Join the Kitten Forum</h2>
      <form action="/signup" method="POST">
        <input type="text" name="username" placeholder="Username" required style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
        <input type="email" name="email" placeholder="Email Address" required style="width: 100%; margin-bottom: 10px; padding: 8px;"><br>
        <button type="submit" style="background-color: #ff9900; color: white; border: none; padding: 10px 20px; cursor: pointer; border-radius: 5px; width: 100%;">Sign Up</button>
      </form>
    </div>
  `);
});

// 3. The Signup Logic (Sends the actual email)
app.post('/signup', async (req, res) => {
  const { username, email } = req.body;
  
  const mailOptions = {
    from: 'kevinewasiuk1@gmail.com',
    to: email,
    subject: 'Verify your Kitten Forum Account',
    html: `<h3>Hello ${username}!</h3><p>Click <a href="https://bsmesomemoreplease.onrender.com/verify-page">here</a> to verify your account.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.send('<h1>Check your email!</h1><p>A verification link has been sent to ' + email + '</p>');
  } catch (error) {
    res.status(500).send('Error sending email: ' + error.message);
  }
});

// 4. Verification Route
app.get('/verify-page', (req, res) => {
  res.send('<h1>✅ Email Verified!</h1><p>Welcome to the Kitten Forum, fellow cat lover.</p>');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
