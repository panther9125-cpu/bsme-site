const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs'); 
const app = express();
const port = process.env.PORT || 10000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(session({
  secret: 'kitten-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Ensures cookies work on standard Render links
}));

app.use(express.urlencoded({ extended: true }));

const kittenBG = `style="background-image: url('https://placecats.com/300/300'); background-repeat: repeat; background-attachment: fixed; color: white; font-family: sans-serif;"`;

const TOPICS = ["IMPORTANT INFORMATION", "Complaint Department", "Suggestion Box", "Karens", "Cheaters + Narcissists", "Stupidity", "Politics", "Liberals", "Sports", "Call Takers", "Bullies", "Generations", "Commercials", "YouTube", "Family Guy", "Cats", "Scammers", "Stocks", "Real Estate", "Economy", "Electronics", "Drugs", "Philosophy", "Riddles", "Business", "Managers", "Utilities", "WWYD?", "Dad Jokes", "LBGTQ", "Sales", "Known Scams", "Immigrants", "Restaurants", "News", "Banks", "Landlords", "Pharma", "Gas", "Insurance", "Business", "KIP", "Quirks", "Interesting", "Other BS"];

// --- DATABASE INIT ---
pool.query(`
  CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT UNIQUE, password TEXT);
  CREATE TABLE IF NOT EXISTS posts (id SERIAL PRIMARY KEY, topic_id INT, heading TEXT, content TEXT, author TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
`).catch(err => console.error("DB Init Error:", err));

// --- ROUTES ---

// AGE GATE
app.get('/', (req, res) => {
  res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.85); width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;"><div style="border: 4px solid #4CAF50; padding: 40px; border-radius: 15px; background: #0b0e14;"><h1 style="color: #4CAF50;">🛑 19+ ONLY 🛑</h1><p>Welcome to the Kitten Forum.</p><div style="margin-top: 30px;"><button onclick="window.location.href='/forum'" style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 10px;">ENTER AS GUEST</button><button onclick="window.location.href='https://www.sesamestreet.org'" style="padding: 15px 30px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">EXIT</button></div></div></div></body>`);
});

// LOGIN / SIGNUP
app.get('/login', (req, res) => res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.8); min-height: 100vh; display: flex; justify-content: center; align-items: center;"><form action="/login" method="POST" style="background: #161b22; padding: 30px; border-radius: 10px; border: 1px solid #00ffff;"><h2 style="color: #4CAF50;">Login</h2><input type="text" name="username" placeholder="Username" required style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #333;"><br><input type="password" name="password" placeholder="Password" required style="width: 100%; padding: 10px; margin-bottom: 20px; background: #0d1117; color: white; border: 1px solid #333;"><br><button type="submit" style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Login</button><p style="margin-top:10px;"><a href="/signup" style="color:#00ffff;">Need an account?</a></p></form></div></body>`));

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (username === 'Ghostrider' && password === '639.771.161.KDE') { 
      req.session.username = 'Ghostrider'; 
      return req.session.save(() => res.redirect('/forum')); 
  }
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length > 0 && await bcrypt.compare(password, result.rows[0].password)) {
    req.session.username = username;
    return req.session.save(() => res.redirect('/forum'));
  }
  res.send('Login Failed. <a href="/login">Retry</a>');
});

app.get('/signup', (req, res) => res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.8); min-height: 100vh; display: flex; justify-content: center; align-items: center;"><form action="/signup" method="POST" style="background: #161b22; padding: 30px; border-radius: 10px; border: 1px solid #00ffff;"><h2 style="color: #4CAF50;">Sign Up</h2><input type="text" name="username" placeholder="Username" required style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #333;"><br><input type="password" name="password" placeholder="Password" required style="width: 100%; padding: 10px; margin-bottom: 20px; background: #0d1117; color: white; border: 1px solid #333;"><br><button type="submit" style="width: 100%; padding: 10px; background: #238636; color: white; border: none; border-radius: 5px; cursor: pointer;">Register</button></form></div></body>`));

app.post('/signup', async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [req.body.username, hashed]);
    res.redirect('/login');
  } catch (e) { res.send('User already exists.'); }
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// FORUM INDEX
app.get('/forum', async (req, res) => {
    const user = req.session.username || "Guest";
    try {
        const counts = await pool.query('SELECT topic_id, COUNT(*) as total FROM posts GROUP BY topic_id');
        const countMap = {}; counts.rows.forEach(r => countMap[r.topic_id] = r.total);
        let topicListHtml = TOPICS.map((t, i) => `<li style="margin-bottom: 8px; background: rgba(0,0,0,0.6); padding: 5px 10px; border-radius: 4px; display: flex; justify-content: space-between;"><a href="/topic/${i + 1}" style="color: #4CAF50; text-decoration: none; font-weight:bold;">${i + 1}. ${t}</a> <span style="color: #00ffff;">${countMap[i + 1] || 0}</span></li>`).join('');
        res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.5); min-height: 100vh; padding: 20px 40px;"><div style="display: flex; justify-content: space-between; align-items:center;"><div><h1 style="color: #4CAF50;">🌌 BSMeSomeMorePlease</h1><p style="color: #00ffff;">Welcome, <b>${user}</b></p></div><div>${req.session.username ? '<a href="/logout" style="color: red; text-decoration:none;">[Logout]</a>' : '<a href="/login" style="color: #00ffff; text-decoration:none;">[Login]</a>'}</div></div><ul style="list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 5px 20px;">${topicListHtml}</ul></div></body>`);
    } catch (err) { res.send("System Error. Try refreshing."); }
});

// TOPIC PAGE (Simple Logic, No Crashes)
app.get('/topic/:id', async (req, res) => {
    const topicId = parseInt(req.params.id);
    const topicName = TOPICS[topicId - 1] || "Unknown Topic";
    const user = req.session.username || "Guest";

    try {
        // We grab the raw date and format it in JAVASCRIPT instead of SQL to avoid errors
        const result = await pool.query(`SELECT * FROM posts WHERE topic_id = $1 ORDER BY id DESC`, [topicId]);
        
        const messagesHtml = result.rows.map(row => {
            // Local formatting for Central Time (US/Chicago)
            const timeStr = new Date(row.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
            
            return `
            <div style="border: 1px solid #333; padding: 15px; margin-bottom: 10px; background: rgba(0,0,0,0.85); border-radius: 8px;">
                <div style="display:flex; justify-content: space-between; border-bottom: 1px solid #222; margin-bottom: 8px; padding-bottom: 5px;">
                    <small style="color: #4CAF50; font-weight:bold;">${row.author} • <span style="color:#aaa;">${timeStr}</span></small>
                    ${(row.author === user || user === 'Ghostrider') && user !== "Guest" ? `<form action="/delete-post/${row.id}" method="POST" style="margin:0;"><input type="hidden" name="topicId" value="${topicId}"><button type="submit" style="color: red; background: none; border: none; cursor: pointer; font-size: 10px;">[DELETE]</button></form>` : ''}
                </div>
                <h4 style="color: #00ffff; margin: 0 0 10px 0;">${row.heading}</h4>
                <p style="white-space: pre-wrap; color: #e6edf3;">${row.content}</p>
            </div>`;
        }).join('');

        const postBox = (user === "Guest") 
            ? `<div style="background: rgba(0,0,0,0.8); padding: 15px; border: 1px solid #4CAF50; border-radius: 5px; text-align:center;"><p style="color: #4CAF50;">Guests can read only. <a href="/login" style="color: #00ffff;">Login</a> or <a href="/signup" style="color: #00ffff;">Sign up</a> to post.</p></div>`
            : `<form action="/post/${topicId}" method="POST" style="background: rgba(0,0,0,0.8); padding: 15px; border: 1px solid #00ffff; border-radius: 5px;">
                <input name="heading" placeholder="Title" required style="width: 100%; margin-bottom: 10px; background:#0d1117; color:white; border:1px solid #333; padding:8px;"><br>
                <textarea name="content" placeholder="Content..." required style="width: 100%; height: 80px; background:#0d1117; color:white; border:1px solid #333; padding:8px;"></textarea><br>
                <button type="submit" style="background: #238636; color: white; padding: 10px 20px; border:none; border-radius:4px; cursor:pointer; margin-top:10px;">Post as ${user}</button>
               </form>`;

        res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.5); min-height: 100vh; padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background: rgba(0,0,0,0.7); padding: 15px; border-radius: 8px; border: 1px solid #4CAF50;">
                <h2 style="color: #4CAF50; margin:0;">${topicName}</h2>
                <button onclick="window.location.href='/forum'" style="background:#333; color:white; border:1px solid #555; padding:8px 15px; cursor:pointer; border-radius:4px;">← Back</button>
            </div>
            <div style="max-width: 900px; margin: auto;">${messagesHtml || '<p style="color:#888; text-align:center;">No posts here yet.</p>'}</div>
            <hr style="border:0.5px solid #333; margin:40px 0;">
            <div style="max-width: 900px; margin: auto;">${postBox}</div>
        </div></body>`);
    } catch (e) { res.send(`Database Error: ${e.message}. <a href='/forum'>Back</a>`); }
});

app.post('/post/:id', async (req, res) => {
    if (!req.session.username) return res.redirect('/login');
    await pool.query('INSERT INTO posts (topic_id, heading, content, author) VALUES ($1, $2, $3, $4)', [req.params.id, req.body.heading, req.body.content, req.session.username]);
    res.redirect('/topic/' + req.params.id);
});

app.post('/delete-post/:postId', async (req, res) => {
    const user = req.session.username;
    if (user === "Ghostrider") { await pool.query('DELETE FROM posts WHERE id = $1', [req.params.postId]); }
    res.redirect('/topic/' + req.body.topicId);
});

app.listen(port, () => console.log('Server running on ' + port));
