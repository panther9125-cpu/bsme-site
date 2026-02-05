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
  cookie: { secure: false }
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

// LOGIN
app.get('/login', (req, res) => res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.8); min-height: 100vh; display: flex; justify-content: center; align-items: center;"><form action="/login" method="POST" style="background: #161b22; padding: 30px; border-radius: 10px; border: 1px solid #00ffff;"><h2 style="color: #4CAF50;">Login</h2><input type="text" name="username" placeholder="Username" required style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #333;"><br><input type="password" name="password" placeholder="Password" required style="width: 100%; padding: 10px; margin-bottom: 20px; background: #0d1117; color: white; border: 1px solid #333;"><br><button type="submit" style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight:bold;">Login</button><p style="margin-top:15px; text-align:center;"><a href="/signup" style="color:#00ffff;">Don't have an account? Sign Up</a></p><p style="text-align:center;"><a href="/forum" style="color:#888;">Back to Forum</a></p></form></div></body>`));

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

// SIGNUP
app.get('/signup', (req, res) => res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.8); min-height: 100vh; display: flex; justify-content: center; align-items: center;"><form action="/signup" method="POST" style="background: #161b22; padding: 30px; border-radius: 10px; border: 1px solid #00ffff;"><h2 style="color: #4CAF50;">Create Account</h2><input type="text" name="username" placeholder="Choose Username" required style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #333;"><br><input type="password" name="password" placeholder="Choose Password" required style="width: 100%; padding: 10px; margin-bottom: 20px; background: #0d1117; color: white; border: 1px solid #333;"><br><button type="submit" style="width: 100%; padding: 10px; background: #238636; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight:bold;">Register</button><p style="margin-top:15px; text-align:center;"><a href="/login" style="color:#00ffff;">Already have an account? Login</a></p></form></div></body>`));

app.post('/signup', async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [req.body.username, hashed]);
    res.redirect('/login');
  } catch (e) { res.send('User already exists. <a href="/signup">Try another name</a>'); }
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// FORUM INDEX
app.get('/forum', async (req, res) => {
    const user = req.session.username || "Guest";
    try {
        const counts = await pool.query('SELECT topic_id, COUNT(*) as total FROM posts GROUP BY topic_id');
        const countMap = {}; counts.rows.forEach(r => countMap[r.topic_id] = r.total);
        
        let topicListHtml = TOPICS.map((t, i) => `
            <li style="margin-bottom: 8px; background: rgba(0,0,0,0.7); padding: 10px; border-radius: 6px; display: flex; justify-content: space-between; border-left: 4px solid #4CAF50;">
                <a href="/topic/${i + 1}" style="color: #4CAF50; text-decoration: none; font-weight:bold; font-size: 1.1em;">${i + 1}. ${t}</a> 
                <span style="color: #00ffff; font-weight:bold; background: #222; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; align-self: center;">${countMap[i + 1] || 0} posts</span>
            </li>`).join('');

        // Navigation Header Logic
        const navLinks = user === "Guest" 
            ? `<div style="display:flex; gap:10px;">
                <button onclick="window.location.href='/login'" style="background:#4CAF50; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">LOGIN</button>
                <button onclick="window.location.href='/signup'" style="background:#238636; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer; font-weight:bold;">SIGN UP</button>
               </div>`
            : `<div style="text-align:right;">
                <span style="color:#00ffff; margin-right:15px;">Logged in as: <b>${user}</b></span>
                <a href="/logout" style="color: #ff4444; text-decoration:none; font-weight:bold;">[Logout]</a>
               </div>`;

        res.send(`
        <body ${kittenBG}>
            <div style="background: rgba(0,0,0,0.6); min-height: 100vh; padding: 20px 40px;">
                <div style="display: flex; justify-content: space-between; align-items:center; border-bottom: 2px solid #4CAF50; padding-bottom: 15px; margin-bottom: 20px;">
                    <h1 style="color: #4CAF50; margin:0; font-size: 2em; text-shadow: 2px 2px #000;">🌌 BSMeSomeMorePlease</h1>
                    ${navLinks}
                </div>
                <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px 30px;">
                    ${topicListHtml}
                </ul>
            </div>
        </body>`);
    } catch (err) { res.send("System Error. Try refreshing."); }
});

// TOPIC PAGE
app.get('/topic/:id', async (req, res) => {
    const topicId = parseInt(req.params.id);
    const topicName = TOPICS[topicId - 1] || "Unknown Topic";
    const user = req.session.username || "Guest";

    try {
        const result = await pool.query(`SELECT * FROM posts WHERE topic_id = $1 ORDER BY id DESC`, [topicId]);
        
        const messagesHtml = result.rows.map(row => {
            const timeStr = new Date(row.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
            return `
            <div style="border: 1px solid #333; padding: 15px; margin-bottom: 12px; background: rgba(15,15,15,0.9); border-radius: 8px;">
                <div style="display:flex; justify-content: space-between; border-bottom: 1px solid #222; margin-bottom: 8px; padding-bottom: 5px;">
                    <small style="color: #4CAF50; font-weight:bold;">${row.author} • <span style="color:#888;">${timeStr}</span></small>
                    ${(row.author === user || user === 'Ghostrider') && user !== "Guest" ? `<form action="/delete-post/${row.id}" method="POST" style="margin:0;"><input type="hidden" name="topicId" value="${topicId}"><button type="submit" style="color: #ff4444; background: none; border: none; cursor: pointer; font-size: 11px; font-weight:bold;">[DELETE]</button></form>` : ''}
                </div>
                <h4 style="color: #00ffff; margin: 0 0 10px 0;">${row.heading}</h4>
                <p style="white-space: pre-wrap; color: #e6edf3; line-height:1.4;">${row.content}</p>
            </div>`;
        }).join('');

        const postBox = (user === "Guest") 
            ? `<div style="background: rgba(0,0,0,0.8); padding: 15px; border: 1px solid #4CAF50; border-radius: 8px; text-align:center;"><p style="color: #4CAF50; margin:0;">You are viewing as a guest. <a href="/login" style="color: #00ffff; font-weight:bold;">Login</a> or <a href="/signup" style="color: #00ffff; font-weight:bold;">Sign Up</a> to post.</p></div>`
            : `<form action="/post/${topicId}" method="POST" style="background: rgba(0,0,0,0.85); padding: 20px; border: 1px solid #00ffff; border-radius: 8px;">
                <h3 style="color:#00ffff; margin-top:0;">Create a Post</h3>
                <input name="heading" placeholder="Subject line..." required style="width: 100%; margin-bottom: 12px; background:#0d1117; color:white; border:1px solid #333; padding:10px; border-radius:4px;"><br>
                <textarea name="content" placeholder="Write your message here..." required style="width: 100%; height: 100px; background:#0d1117; color:white; border:1px solid #333; padding:10px; border-radius:4px; font-family:sans-serif;"></textarea><br>
                <button type="submit" style="background: #238636; color: white; padding: 10px 25px; border:none; border-radius:4px; cursor:pointer; margin-top:10px; font-weight:bold;">POST AS ${user.toUpperCase()}</button>
               </form>`;

        res.send(`<body ${kittenBG}><div style="background: rgba(0,0,0,0.5); min-height: 100vh; padding: 20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; background: rgba(0,0,0,0.8); padding: 15px; border-radius: 8px; border-bottom: 3px solid #4CAF50;">
                <h2 style="color: #4CAF50; margin:0;">${topicName}</h2>
                <button onclick="window.location.href='/forum'" style="background:#444; color:white; border:none; padding:8px 20px; cursor:pointer; border-radius:4px; font-weight:bold;">← BACK TO TOPICS</button>
            </div>
            <div style="max-width: 900px; margin: auto;">${messagesHtml || '<p style="color:#888; text-align:center; padding:50px;">No posts yet. Start the conversation!</p>'}</div>
            <hr style="border:0.5px solid #444; margin:40px 0;">
            <div style="max-width: 900px; margin: auto;">${postBox}</div>
        </div></body>`);
    } catch (e) { res.send(`Error: ${e.message}`); }
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
