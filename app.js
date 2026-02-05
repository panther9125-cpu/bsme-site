const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer'); // New requirement
const app = express();
const port = process.env.PORT || 10000;

// EMAIL CONFIGURATION
// Replace these with your actual info or Render Environment Variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'YOUR_EMAIL@gmail.com', 
    pass: 'YOUR_APP_PASSWORD'    
  }
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(session({
  secret: 'kitten-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.urlencoded({ extended: true }));

const kittenBG = `style="background-image: url('https://placecats.com/300/300'); background-repeat: repeat; background-attachment: fixed; color: white; font-family: sans-serif;"`;
const TOPICS = ["IMPORTANT INFORMATION", "Complaint Department", "Suggestion Box", "Karens", "Cheaters + Narcissists", "Stupidity", "Politics", "Liberals", "Sports", "Call Takers", "Bullies", "Generations", "Commercials", "YouTube", "Family Guy", "Cats", "Scammers", "Stocks", "Real Estate", "Economy", "Electronics", "Drugs", "Philosophy", "Riddles", "Business", "Managers", "Utilities", "WWYD?", "Dad Jokes", "LBGTQ", "Sales", "Known Scams", "Immigrants", "Restaurants", "News", "Banks", "Landlords", "Pharma", "Gas", "Insurance", "Business", "KIP", "Quirks", "Interesting", "Other BS"];

// --- DATABASE INIT (Updated with Email & Verified status) ---
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY, 
    username TEXT UNIQUE, 
    email TEXT UNIQUE,
    password TEXT, 
    is_verified BOOLEAN DEFAULT FALSE, 
    verification_token TEXT
  );
  CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, topic_id INT, heading TEXT, content TEXT, author TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
`).catch(err => console.error("DB Init Error:", err));

// --- ROUTES ---

// SIGNUP PAGE
app.get('/signup', (req, res) => {
    res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.8); min-height: 100vh; display: flex; justify-content: center; align-items: center;"><form action="/signup" method="POST" style="background: #161b22; padding: 30px; border-radius: 10px; border: 1px solid #00ffff;"><h2 style="color: #4CAF50;">Register</h2>
    <input type="text" name="username" placeholder="Username" required style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #333;"><br>
    <input type="email" name="email" placeholder="Valid Email" required style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #333;"><br>
    <input type="password" name="password" placeholder="Password" required style="width: 100%; padding: 10px; margin-bottom: 20px; background: #0d1117; color: white; border: 1px solid #333;"><br>
    <button type="submit" style="width: 100%; padding: 10px; background: #238636; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight:bold;">Send Verification Email</button></form></div></body>`);
});

// SIGNUP LOGIC
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const token = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const hashed = await bcrypt.hash(password, 10);

    try {
        await pool.query('INSERT INTO users (username, email, password, verification_token) VALUES ($1, $2, $3, $4)', [username, email, hashed, token]);
        
        // Send Email
        const mailOptions = {
            from: '"Kitten Forum" <YOUR_EMAIL@gmail.com>',
            to: email,
            subject: 'Verify your Kitten Account',
            text: `Your verification code is: ${token}`
        };

        await transporter.sendMail(mailOptions);
        res.send(`<body ${kittenBG}><div style="text-align:center; padding:50px; background:rgba(0,0,0,0.8); color:white;"><h2>Check your email!</h2><p>Enter the 6-digit code sent to ${email}:</p>
        <form action="/verify" method="POST"><input type="hidden" name="email" value="${email}"><input type="text" name="token" placeholder="000000"><button type="submit">Verify</button></form></div></body>`);
    } catch (e) {
        res.send('Username or Email already taken.');
    }
});

// VERIFY LOGIC
app.post('/verify', async (req, res) => {
    const { email, token } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND verification_token = $2', [email, token]);

    if (result.rows.length > 0) {
        await pool.query('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE email = $1', [email]);
        res.send('Email verified! You can now <a href="/login" style="color:cyan;">Login</a>');
    } else {
        res.send('Invalid code. <a href="/signup">Try again</a>');
    }
});

// LOGIN LOGIC (Updated to check verification)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Ghostrider bypasses verification
    if (username === 'Ghostrider' && password === '639.771.161.KDE') {
        req.session.username = 'Ghostrider';
        return req.session.save(() => res.redirect('/forum'));
    }

    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
        const user = result.rows[0];
        if (!user.is_verified) return res.send('Please verify your email first!');
        
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            req.session.username = username;
            return req.session.save(() => res.redirect('/forum'));
        }
    }
    res.send('Login Failed.');
});

// (Rest of the forum routes remain the same...)
app.get('/forum', async (req, res) => { /* Same as previous version */ });
app.get('/topic/:id', async (req, res) => { /* Same as previous version */ });
app.post('/post/:id', async (req, res) => { /* Same as previous version */ });
app.listen(port, () => console.log('Server running on ' + port));
