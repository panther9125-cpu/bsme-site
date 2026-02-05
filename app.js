const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); 
const app = express();
const port = process.env.PORT || 10000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(session({
  secret: 'kitten-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));

const kittenBG = `style="background-image: url('https://placecats.com/300/300'); background-repeat: repeat; background-attachment: fixed; color: white; font-family: sans-serif;"`;

// DATABASE SETUP
pool.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE,
    password TEXT
  );
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    topic_id INT,
    heading TEXT,
    content TEXT,
    author TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`).then(() => console.log("Database tables ready!")).catch(err => console.error(err));

// --- ROUTES ---

// AGE GATE
app.get('/', (req, res) => {
  res.send(`
    <body ${kittenBG}>
        <div style="background: rgba(0,0,0,0.85); width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
            <div style="border: 4px solid #4CAF50; padding: 40px; border-radius: 15px; background: #0b0e14;">
                <h1 style="color: #4CAF50;">🛑 19+ ONLY 🛑</h1>
                <p>Welcome to the Kitten Forum.</p>
                <div style="margin-top: 30px;">
                    <button onclick="window.location.href='/forum'" style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 10px;">ENTER AS GUEST</button>
                    <button onclick="window.location.href='https://www.sesamestreet.org'" style="padding: 15px 30px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">EXIT</button>
                </div>
                <p style="margin-top: 20px;"><a href="/signup" style="color: #00ffff;">Create an Account</a> or <a href="/login" style="color: #00ffff;">Login</a></p>
            </div>
        </div>
    </body>
  `);
});

// SIGN UP PAGE
app.get('/signup', (req, res) => {
  res.send(`
    <body ${kittenBG}><div style="background: rgba(0,0,0,0.8); min-height: 100vh; display: flex; justify-content: center; align-items: center;">
      <form action="/signup" method="POST" style="background: #161b22; padding: 30px; border-radius: 10px; border: 1px solid #00ffff;">
        <h2 style="color: #4CAF50; margin-top: 0;">Create Account</h2>
        <input type="text" name="username" placeholder="Username" required style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #333;"><br>
        <input type="password" name="password" placeholder="Password" required style="width: 100%; padding: 10px; margin-bottom: 20px; background: #0d1117; color: white; border: 1px solid #333;"><br>
        <button type="submit" style="width: 100%; padding: 10px; background: #238636; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Register</button>
        <p style="font-size: 0.8em; margin-top: 15px;">Already have an account? <a href="/login" style="color: #00ffff;">Login here</a></p>
      </form>
    </div></body>
  `);
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashed]);
    res.send('Account created! <a href="/login" style="color: #4CAF50;">Login now</a>');
  } catch (e) { res.send('Username taken. <a href="/signup">Try another</a>'); }
});

// LOGIN PAGE
app.get('/login', (req, res) => {
  res.send(`
    <body ${kittenBG}><div style="background: rgba(0,0,0,0.8); min-height: 100vh; display: flex; justify-content: center; align-items: center;">
      <form action="/login" method="POST" style="background: #161b22; padding: 30px; border-radius: 10px; border: 1px solid #00ffff;">
        <h2 style="color: #4CAF50; margin-top: 0;">Login</h2>
        <input type="text" name="username" placeholder="Username" required style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #333;"><br>
        <input type="password" name="password" placeholder="Password" required style="width: 100%; padding: 10px; margin-bottom: 20px; background: #0d1117; color: white; border: 1px solid #333;"><br>
        <button type="submit" style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Login</button>
      </form>
    </div></body>
  `);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  if (result.rows.length > 0 && await bcrypt.compare(password, result.rows[0].password)) {
    req.session.username = username;
    res.redirect('/forum');
  } else { res.send('Wrong info. <a href="/login">Try again</a>'); }
});

app.get('/logout', (req, res) => { req.session.destroy(); res.redirect('/'); });

// FORUM INDEX
app.get('/forum', async (req, res) => {
    const user = req.session.username || "Guest";
    const topics = ["IMPORTANT INFORMATION", "Complaint Department", "Suggestion Box", "Karens", "Cheaters + Narcissists", "Stupidity", "Politics", "Liberals", "Sports", "Call Takers", "Bullies", "Generations", "Commercials", "YouTube", "Family Guy", "Cats", "Scammers", "Stocks", "Real Estate", "Economy", "Electronics", "Drugs", "Philosophy", "Riddles", "Business", "Managers", "Utilities", "WWYD?", "Dad Jokes", "LBGTQ", "Sales", "Known Scams", "Immigrants", "Restaurants", "News", "Banks", "Landlords", "Pharma", "Gas", "Insurance", "Business", "KIP", "Quirks", "Interesting", "Other BS"];

    try {
        const counts = await pool.query('SELECT topic_id, COUNT(*) as total FROM posts GROUP BY topic_id');
        const countMap = {};
        counts.rows.forEach(r => countMap[r.topic_id] = r.total);

        let topicListHtml = topics.map((t, i) => {
            const topicNum = i + 1;
            return `<li style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.65); padding: 5px 10px; border-radius: 4px; border: 1px solid #222;">
                <a href="/topic/${topicNum}" style="color: #4CAF50; text-decoration: none; font-weight: bold; font-size: 0.9em;">${topicNum}. ${t}</a>
                <span style="background: #333; color: #00ffff; font-size: 0.7em; padding: 2px 6px; border-radius: 8px;">${countMap[topicNum] || 0}</span>
            </li>`;
        }).join('');

        res.send(`
            <html>
            <body ${kittenBG}>
                <div style="background: rgba(0,0,0,0.5); min-height: 100vh; padding: 20px 40px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h1 style="color: #4CAF50; margin:0;">🌌 BSMeSomeMorePlease</h1>
                            <p style="color: #00ffff; margin:0;">Welcome, <b>${user}</b></p>
                        </div>
                        <div>
                          <img src="https://placecats.com/80/80?t=${Date.now()}" style="border: 2px solid #4CAF50; border-radius: 50%;">
                          <div style="text-align: right; margin-top: 5px;">
                            ${req.session.username ? '<a href="/logout" style="color: #ff4444; font-size: 0.8em;">Logout</a>' : '<a href="/login" style="color: #00ffff; font-size: 0.8em;">Login</a>'}
                          </div>
                        </div>
                    </div>
                    <hr style="border: 0.5px solid #333; margin: 20px 0;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px 40px;">
                        <ul style="list-style: none; padding: 0;">${topicListHtml}</ul>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (err) { res.send("Error loading."); }
});

// TOPIC PAGE (Post Blocked for Guests)
app.get('/topic/:id', async (req, res) => {
    const topicId = req.params.id;
    const user = req.session.username || "Guest";
    let messagesHtml = '<p style="color: #ccc;">No messages yet.</p>';
    
    try {
        const result = await pool.query("SELECT id, heading, content, author, TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'US/Eastern', 'Mon DD, HH:MI AM') as time FROM posts WHERE topic_id = $1 ORDER BY id DESC", [topicId]);
        if (result.rows.length > 0) {
            messagesHtml = result.rows.map(row => `
                <div style="border: 1px solid #30363d; padding: 10px; margin-bottom: 8px; background: rgba(22, 27, 34, 0.92); border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 5px;">
                        <div>
                            <h4 style="color: #00ffff; margin: 0; font-size: 0.9em; display:inline;">${row.heading || 'GENERAL'}</h4>
                            <span style="color: #888; font-size: 0.7em; margin-left: 10px;">by ${row.author}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="color: #666; font-size: 0.65em;">${row.time}</span>
                            ${(row.author === user && user !== "Guest") || user === "Ghostrider" ? `<form action="/delete-post/${row.id}" method="POST" style="margin: 0;"><input type="hidden" name="topicId" value="${topicId}"><button type="submit" style="background: none; border: none; color: #ff4444; cursor: pointer; font-size: 0.7em;">[X]</button></form>` : ''}
                        </div>
                    </div>
                    <div style="color: #e6edf3; font-size: 0.9em; white-space: pre-wrap;">${row.content}</div>
                </div>`).join('');
        }
    } catch (e) { console.error(e); }

    // Logic: Only show post box if user is NOT a Guest
    const postSection = (user === "Guest") 
        ? `<div style="background: rgba(22, 27, 34, 0.9); padding: 15px; border-radius: 8px; border: 1px solid #4CAF50; max-width: 500px;">
            <p style="color: #4CAF50; margin: 0;">Want to join the conversation? <a href="/signup" style="color: #00ffff; font-weight: bold;">Sign up</a> or <a href="/login" style="color: #00ffff; font-weight: bold;">Login</a> to post!</p>
            <button onclick="window.location.href='/forum'" style="background: #333; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Back to Forum</button>
           </div>`
        : `<form action="/post/${topicId}" method="POST" style="background: rgba(22, 27, 34, 0.9); padding: 15px; border-radius: 8px; border: 1px solid #00ffff; max-width: 500px;">
                <input type="text" name="heading" placeholder="Heading..." required style="width: 100%; padding: 8px; margin-bottom: 8px; background: #0d1117; color: white; border: 1px solid #333;">
                <textarea name="content" placeholder="Message..." required style="width: 100%; height: 60px; background: #0d1117; color: white; border: 1px solid #333;"></textarea>
                <button type="submit" style="background: #238636; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-top: 10px;">Post as ${user}</button>
                <button type="button" onclick="window.location.href='/forum'" style="background: #333; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-top: 10px; margin-left: 5px;">Back</button>
           </form>`;

    res.send(`
        <html>
        <body ${kittenBG}>
            <div style="background: rgba(0,0,0,0.5); min-height: 100vh; padding: 20px 40px;">
                <h2 style="color: #4CAF50;">Topic #${topicId}</h2>
                <div style="margin-bottom: 20px;">${messagesHtml}</div>
                ${postSection}
            </div>
        </body>
        </html>
    `);
});

app.post('/post/:id', async (req, res) => {
    // Backend check: prevent Guests from using the POST route via tools
    if (!req.session.username) { return res.redirect('/login'); }
    const author = req.session.username;
    await pool.query('INSERT INTO posts (topic_id, heading, content, author) VALUES ($1, $2, $3, $4)', [req.params.id, req.body.heading, req.body.content, author]);
    res.redirect('/topic/' + req.params.id);
});

app.post('/delete-post/:postId', async (req, res) => {
    const user = req.session.username;
    if (!user) return res.redirect('/login');
    const post = await pool.query('SELECT author FROM posts WHERE id = $1', [req.params.postId]);
    if (post.rows[0] && (post.rows[0].author === user || user === "Ghostrider")) {
        await pool.query('DELETE FROM posts WHERE id = $1', [req.params.postId]);
    }
    res.redirect('/topic/' + req.body.topicId);
});

app.listen(port, () => console.log('Server running on ' + port));
