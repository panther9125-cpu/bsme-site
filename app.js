const express = require('express');
const session = require('express-session');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 10000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(session({
  secret: 'bsme-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));

// KITTEN STYLING (The "Purr-fect" Background)
const kittenBG = `style="background-image: url('https://placecats.com/300/300'); background-repeat: repeat; background-attachment: fixed; color: white; font-family: sans-serif;"`;

// DATABASE STRUCTURE CHECK
pool.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    topic_id INT,
    heading TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ALTER TABLE posts ADD COLUMN IF NOT EXISTS heading TEXT;
`).catch(err => console.error("Database error:", err));

const checkAge = (req, res, next) => {
  if (req.session.isAdult) { next(); } 
  else { res.redirect('/'); }
};

// AGE GATE (19+ Version)
app.get('/', (req, res) => {
  res.send(`
    <html>
    <body ${kittenBG}>
        <div style="background: rgba(0,0,0,0.85); width: 100%; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
            <div style="border: 4px solid #4CAF50; padding: 40px; border-radius: 15px; background: #0b0e14; max-width: 500px;">
                <h1 style="color: #4CAF50;">🛑 STOP! 🛑</h1>
                <p style="font-size: 1.3em;">This forum is restricted to ages <b>19 and older</b>.</p>
                <p style="color: #888;">Younger users will be sent to Sesame Street.</p>
                <div style="margin-top: 30px;">
                    <form action="/verify-age" method="POST" style="display: inline;">
                        <button type="submit" style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; margin-right: 10px;">I AM 19+</button>
                    </form>
                    <button onclick="window.location.href='https://www.sesamestreet.org'" style="padding: 15px 30px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">I AM UNDER 19</button>
                </div>
            </div>
        </div>
    </body>
    </html>
  `);
});

app.post('/verify-age', (req, res) => {
  req.session.isAdult = true;
  res.redirect('/forum');
});

// ADMIN LOGIN
app.get('/login', (req, res) => {
  res.send(`
    <body ${kittenBG}>
        <div style="background: rgba(0,0,0,0.7); min-height: 100vh; padding-top: 50px; text-align: center;">
            <h2 style="text-shadow: 2px 2px black;">Admin Login</h2>
            <form action="/login" method="POST" style="display: inline-block; text-align: left; background: #161b22; padding: 20px; border-radius: 10px; border: 1px solid #00ffff;">
                <label>Username:</label><br>
                <input type="text" name="username" style="margin-bottom: 10px; padding: 8px; border-radius: 5px; background: #0d1117; color: white; border: 1px solid #333;"><br>
                <label>Password:</label><br>
                <input type="password" name="password" style="margin-bottom: 20px; padding: 8px; border-radius: 5px; background: #0d1117; color: white; border: 1px solid #333;"><br>
                <button type="submit" style="width: 100%; padding: 10px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Login</button>
            </form>
        </div>
    </body>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const admins = { 'Ghostrider': 'Ride123!', 'Boobs': 'Boobs456!' };
  if (admins[username] && admins[username] === password) {
    req.session.user = username;
    res.redirect('/forum');
  } else {
    res.send('Failed Credentials. <a href="/login" style="color: cyan;">Try again</a>');
  }
});

app.get('/logout', (req, res) => { req.session.user = null; res.redirect('/forum'); });

// FORUM INDEX
app.get('/forum', checkAge, async (req, res) => {
    const topics = ["IMPORTANT INFORMATION (READ ONLY)", "Complaint Department", "Suggestion Box", "Karens", "Cheaters + Narcissists", "Stupidity is Abundant", "Government + Politics", "Liberals", "Sports", "Human and AI Call Takers", "Bullies", "Generations", "Commercials", "YouTube Videos", "Lets Talk Family Guy", "Lets Talk Cats", "Scammers", "Stocks", "Mortgages, Rent and Taxes", "World Economy", "Electronics", "Illegal Drugs", "Psychology + Philosophy", "Riddles", "Business Ideas", "Managers", "Utility Companies", "What Would You Do If?", "Dad Jokes", "LBGTQ", "Salesmen", "Known Scams", "Bad Immigrants", "Restaurants + Bars", "News Networks", "Banks", "Landlords", "Pharmaceuticals", "Gas Prices", "Insurance", "Big Businesses", "KIP: Knowledge is Power", "People's Silly Quirks", "Anything Interesting", "All Other BS"];

    try {
        const counts = await pool.query('SELECT topic_id, COUNT(*) as total FROM posts GROUP BY topic_id');
        const countMap = {};
        counts.rows.forEach(r => countMap[r.topic_id] = r.total);

        let topicListHtml = topics.map((t, i) => {
            const topicNum = i + 1;
            return `<li style="margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center; padding-right: 20px; background: rgba(0,0,0,0.65); padding: 5px; border-radius: 4px; border: 1px solid #222;">
                <a href="/topic/${topicNum}" style="color: #4CAF50; text-decoration: none; font-weight: bold; font-size: 0.9em;">${topicNum}. ${t}</a>
                <span style="background: #333; color: #00ffff; font-size: 0.7em; padding: 2px 6px; border-radius: 8px;">${countMap[topicNum] || 0}</span>
            </li>`;
        }).join('');

        res.send(`
            <html>
            <body ${kittenBG}>
                <div style="background: rgba(0,0,0,0.5); min-height: 100vh; padding: 20px 40px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h1 style="color: #4CAF50; font-size: 1.8em; text-shadow: 2px 2px black; margin: 0;">🌌 BSMeSomeMorePlease</h1>
                            <p style="color: #888; font-size: 0.9em;">Refresh for a new kitten of the hour!</p>
                        </div>
                        <div style="text-align: right;">
                            <img src="https://placecats.com/150/100?t=${Date.now()}" style="border: 2px solid #4CAF50; border-radius: 10px; margin-bottom: 10px;">
                            <div>${req.session.user ? `<span style="color: #888;">${req.session.user}</span> <a href="/logout" style="color: #f44336; margin-left:10px;">Logout</a>` : `<a href="/login" style="color: #888;">Admin</a>`}</div>
                        </div>
                    </div>
                    <hr style="border: 0.5px solid #333; margin-bottom: 20px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px 40px;">
                        <ul style="list-style: none; padding: 0;">${topicListHtml}</ul>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (err) { res.send("Error loading forum."); }
});

// TOPIC PAGE (Timezone Adjusted)
app.get('/topic/:id', checkAge, async (req, res) => {
    const topicId = req.params.id;
    const isAdmin = (req.session.user === 'Ghostrider' || req.session.user === 'Boobs');
    let messagesHtml = '<p style="color: #ccc;">No messages yet.</p>';
    
    try {
        const result = await pool.query("SELECT id, heading, content, TO_CHAR(created_at AT TIME ZONE 'UTC' AT TIME ZONE 'US/Central', 'Mon DD, HH:MI AM') as time FROM posts WHERE topic_id = $1 ORDER BY id DESC", [topicId]);
        if (result.rows.length > 0) {
            messagesHtml = result.rows.map(row => `
                <div style="border: 1px solid #30363d; padding: 10px; margin-bottom: 8px; background: rgba(22, 27, 34, 0.92); border-radius: 6px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 5px;">
                        <h4 style="color: #00ffff; margin: 0; font-size: 0.9em;">${row.heading || 'GENERAL'}</h4>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="color: #888; font-size: 0.65em;">${row.time}</span>
                            ${isAdmin ? `<form action="/delete-post/${row.id}" method="POST" style="margin: 0;"><input type="hidden" name="topicId" value="${topicId}"><button type="submit" style="background: none; border: none; color: #ff4444; cursor: pointer; font-size: 0.7em;">[X]</button></form>` : ''}
                        </div>
                    </div>
                    <div style="color: #e6edf3; line-height: 1.3; font-size: 0.9em; white-space: pre-wrap;">${row.content}</div>
                </div>
            `).join('');
        }
    } catch (err) { console.error(err); }

    const postBox = (topicId === "1" && !isAdmin) ? `<p style="color: #f44336; background: rgba(0,0,0,0.5); padding: 5px;">[ READ ONLY ]</p>` : `
        <form action="/post/${topicId}" method="POST" style="background: rgba(22, 27, 34, 0.92); padding: 12px; border-radius: 8px; border: 1px solid #00ffff; max-width: 500px; margin-top: 20px;">
            <input type="text" name="heading" placeholder="Heading..." style="width: 100%; padding: 6px; margin-bottom: 6px; background: #0d1117; color: white; border: 1px solid #333; border-radius: 4px;">
            <textarea name="content" placeholder="Message..." style="width: 100%; height: 60px; background: #0d1117; color: white; border: 1px solid #333; padding: 6px; border-radius: 4px;"></textarea>
            <button type="submit" style="background: #238636; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-top: 6px; font-weight: bold;">Post</button>
        </form>`;

    res.send(`
        <html>
        <body ${kittenBG}>
            <div style="background: rgba(0,0,0,0.5); min-height: 100vh; padding: 20px 40px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="color: #4CAF50; margin: 0; text-shadow: 1px 1px black;">Topic #${topicId}</h2>
                    <button onclick="window.location.href='/forum'" style="background: #333; border: 1px solid #555; color: white; padding: 5px 15px; border-radius: 4px; cursor: pointer;">Back</button>
                </div>
                <hr style="border: 0.5px solid #333; margin: 15px 0;">
                <div style="margin-bottom: 20px;">${messagesHtml}</div>
                ${postBox}
            </div>
        </body>
        </html>
    `);
});

app.post('/delete-post/:postId', async (req, res) => {
    if (!(req.session.user === 'Ghostrider' || req.session.user === 'Boobs')) return res.status(403).send('Unauthorized');
    try { await pool.query('DELETE FROM posts WHERE id = $1', [req.params.postId]); } catch (err) { console.error(err); }
    res.redirect('/topic/' + req.body.topicId);
});

app.post('/post/:id', async (req, res) => {
    const isAdmin = (req.session.user === 'Ghostrider' || req.session.user === 'Boobs');
    if (req.params.id === "1" && !isAdmin) { return res.redirect('/topic/1'); }
    try { await pool.query('INSERT INTO posts (topic_id, heading, content) VALUES ($1, $2, $3)', [req.params.id, req.body.heading, req.body.content]); } 
    catch (err) { console.error(err); }
    res.redirect('/topic/' + req.params.id);
});

app.listen(port, () => { console.log('Server running on port ' + port); });
