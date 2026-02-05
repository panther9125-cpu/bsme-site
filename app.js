const express = require('express');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'kevinewasiuk1@gmail.com', 
    pass: process.env.GMAIL_PASS 
  }
});

// The Homepage with Login, Signup, and Age Verification
app.get('/', (req, res) => {
  res.send(`
    <style>
      body { font-family: sans-serif; display: flex; justify-content: center; padding-top: 50px; background: #f4f4f4; }
      .container { background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 350px; }
      .tabs { display: flex; margin-bottom: 20px; border-bottom: 2px solid #eee; }
      .tab { flex: 1; padding: 10px; text-align: center; cursor: pointer; font-weight: bold; color: #888; }
      .active { color: #ff9900; border-bottom: 2px solid #ff9900; }
      input { width: 100%; margin-bottom: 12px; padding: 10px; border: 1px solid #ddd; border-radius: 6px; box-sizing: border-box; }
      button { width: 100%; padding: 10px; background: #ff9900; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
      .hidden { display: none; }
      .age-check { font-size: 12px; margin-bottom: 15px; display: flex; align-items: center; }
      .age-check input { width: auto; margin-right: 10px; margin-bottom: 0; }
    </style>

    <div class="container">
      <div class="tabs">
        <div id="loginTab" class="tab active" onclick="showLogin()">Login</div>
        <div id="signupTab" class="tab" onclick="showSignup()">Sign Up</div>
      </div>

      <form id="loginForm" action="/login" method="POST">
        <input type="text" name="username" placeholder="Username" required>
        <input type="password" name="password" placeholder="Password" required>
        <button type="submit">Log In</button>
      </form>

      <form id="signupForm" class="hidden" action="/signup" method="POST">
        <input type="text" name="username" placeholder="Choose Username" required>
        <input type="email" name="email" placeholder="Email Address" required>
        <input type="password" name="password" placeholder="Create Password" required>
        <div class="age-check">
          <input type="checkbox" name="age_verify" required>
          <label>I confirm I am 13 years or older 🐾</label>
        </div>
        <button type="submit">Create Account</button>
      </form>
    </div>

    <script>
      function showLogin() {
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('signupForm').classList.add('hidden');
        document.getElementById('loginTab').classList.add('active');
        document.getElementById('signupTab').classList.remove('active');
      }
      function showSignup() {
        document.getElementById('signupForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('signupTab').classList.add('active');
        document.getElementById('loginTab').classList.remove('active');
      }
    </script>
  `);
});

app.post('/signup', async (req, res) => {
  const { username, email } = req.body;
  const mailOptions = {
    from: 'kevinewasiuk1@gmail.com',
    to: email,
    subject: 'Verify your Kitten Forum Account',
    html: `<h3>Welcome ${username}!</h3><p>Click <a href="https://bsmesomemoreplease.onrender.com/verify-page">here</a> to verify.</p>`
  };
  try {
    await transporter.sendMail(mailOptions);
    res.send('<h1>Check your email!</h1><p>Verification link sent to ' + email + '</p>');
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  }
});

app.post('/login', (req, res) => {
  res.send(`<h1>Welcome Back!</h1><p>Checking credentials for ${req.body.username}...</p>`);
});

app.get('/verify-page', (req, res) => {
  res.send('<h1>✅ Email Verified!</h1><p>Welcome to the Kitten Forum.</p>');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => { console.log('Server running on port ' + PORT); });
