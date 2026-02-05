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

// GATEKEEPER
const checkAge = (req, res, next) => {
  if (req.session.isAdult) { next(); } 
  else { res.redirect('/'); }
};

// AGE GATE
app.get('/', (req, res) => {
  res.send(`
    <html>
    <body style="background-color: #0b0e14; color: white; text-align: center; font-family: sans-serif; padding-top: 100px;">
        <div style="border: 2px solid #333; display: inline-block; padding: 40px; border-radius: 15px; background: rgba(255,255,255,0.05);">
            <h1 style="color: #4CAF50;">STOP! Verification Required</h1>
            <p>You must be 18 or older to view the topics.</p>
            <form action="/verify-age" method="POST">
                <button type="submit" style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">I am 18+ - ENTER FORUM</button>
            </form>
        </div>
    </body>
    </html>
  `);
});

app.post('/verify-age', (req, res) => {
  req.session.isAdult = true;
  res.redirect('/forum');
});

// LOGIN PAGE (For Admins)
app.get('/login', (req, res) => {
  res.send(`
    <body style="background-color: #0b0e14; color: white; font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h2>Admin Login</h2>
        <form action="/login" method="POST">
            <input type="text" name="username" placeholder="Username" style="padding: 10px; border-radius: 5px; border: 1px solid #333; background: #0d1117; color: white;">
            <button type="submit" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">Login</button>
        </form>
    </body>
  `);
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username === 'Ghostrider' || username === 'Boobs') {
    req.session.user = username;
    res.redirect('/forum');
  } else {
    res.send('Invalid Admin Username. <a href="/login" style="color: #4CAF50;">Try again</a>');
  }
});

// FORUM INDEX
app.get('/forum', checkAge, (req, res) => {
    const topics = [
        "IMPORTANT INFORMATION ABOUT THIS SITE (READ ONLY)", "Complaint Department", "Suggestion Box", "Karens", "Cheaters + Narcissists", 
        "Stupidity is Abundant", "Government + Politics", "Liberals", "Sports", "Human and AI Call Takers", "Bullies", "Generations", "Commercials", 
        "YouTube Videos", "Lets Talk Family Guy", "Lets Talk Cats", "Scammers: Voice, Text, Internet", "Stocks", "Mortgages, Rent and Taxes", 
        "World Economy", "Electronics", "Illegal Drugs", "Psychology + Philosophy + Deep Thoughts", "Riddles", "Business Ideas", 
        "Managers, Supervisors and the Never Ending Hierarchy", "Utility Companies", "What Would You Do If?", "Dad Jokes", "LBGTQ", "Salesmen and Saleswomen", 
        "Known Scams (Information Only)", "Bad Immigrants", "Restaurants, Bars and Other Stores", "News Networks", "Banks and Other Financial Institutions", 
        "Landlords, Leasing Agents and Property Managers", "Pharmaceutical Companies", "Gas Prices", "Insurance", "Big Businesses", 
        "KIP: Knowledge is Power", "People in General and All Their Silly Quirks", "Anything Interesting", "All Other BS Not Listed"
    ];

    let topicListHtml = topics.map((t, i) => `
        <li style="margin-bottom: 10px;">
            <a href="/topic/${i + 1}" style="color: #4CAF50; text-decoration: none; font-weight: bold;">${i + 1}. ${t}</a>
        </li>
    `).join('');

    res.send(`
        <html>
        <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px;">
            <div style="display: flex; justify-content: space-between;">
                <h1 style="color: #4CAF50;">🌌 BSMeSomeMorePlease Forums</h1>
                ${req.session.user ? `<span style="color: #888;">Logged in as: <b>${req.session.user}</b></span>` : `<a href="/login" style="color: #888; text-decoration: none;">Admin Login</a>`}
            </div>
            <hr style="border: 0.5px solid #333;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <ul style="list-style: none; padding: 0;">${topicListHtml}</ul>
            </div>
        </body>
        </html>
    `);
});

// TOPIC PAGE
app.get('/topic/:id', checkAge, async (req, res) => {
    const topicId = req.params.id;
    const isAdmin = (req.session.user === 'Ghostrider' || req.session.user === 'Boobs');

    let messagesHtml = '<p style="color: #666;">No messages yet.</p>';
    try {
        const result = await pool.query('SELECT content FROM posts WHERE topic_id = $1 ORDER BY id DESC', [topicId]);
        if (result.rows.length > 0) {
            messagesHtml = result.rows.map(row => `<div style="border-bottom: 1px solid #333; padding: 10px; margin-bottom: 10px;">${row.content}</div>`).join('');
        }
    } catch (err) { console.error(err); }

    // Logic: Only Admins can post to Topic #1. Everyone else can post to everything else.
    let showPostBox = true;
    if (topicId === "1" && !isAdmin) { showPostBox = false; }

    const postBox = showPostBox 
        ? `<form action="/post/${topicId}" method="POST" style="background: #161b22; padding: 20px; border-radius: 10px; border: 1px solid #30363d; max-width: 600px;">
                <textarea name="content" placeholder="Type your message..." style="width: 100%; height: 80px; background: #0d1117; color: white; border: 1px solid #30363d; padding: 10px;"></textarea>
                <br><br>
                <button type="submit" style="background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Post Message</button>
           </form>`
        : `<p style="color: #f44336; font-weight: bold;">[ READ ONLY: Only Ghostrider and Boobs can post here ]</p>`;

    res.send(`
        <html>
        <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px;">
            <h1 style="color: #4CAF50;">Topic #${topicId}</h1>
            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 10px; margin-bottom: 20px;">${messagesHtml}</div>
            ${postBox}
            <br>
            <button onclick="window.location.href='/forum'" style="background: none; border: 1px solid #333; color: #888; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Back to Forum</button>
        </body>
        </html>
    `);
});

app.post('/post/:id', async (req, res) => {
    const isAdmin = (req.session.user === 'Ghostrider' || req.session.user === 'Boobs');
    if (req.params.id === "1" && !isAdmin) { return res.redirect('/topic/1'); }
    
    try { await pool.query('INSERT INTO posts (topic_id, content) VALUES ($1, $2)', [req.params.id, req.body.content]); } 
    catch (err) { console.error(err); }
    res.redirect('/topic/' + req.params.id);
});

app.listen(port, () => { console.log('Server running on port ' + port); });
