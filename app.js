const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 10000;

// 1. CONNECT TO YOUR RENDER DATABASE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// AUTO-CREATE TABLE ON STARTUP
pool.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    topic_id INT,
    content TEXT
  );
`).then(() => console.log("Database table is ready!"))
  .catch(err => console.error("Table error:", err));
// Middleware to handle form data
app.use(express.urlencoded({ extended: true }));

// THE AGE GATE
app.get('/', (req, res) => {
  res.send(`
    <html>
    <body style="background-color: #0b0e14; color: white; text-align: center; font-family: sans-serif; padding-top: 100px;">
        <div style="border: 2px solid #333; display: inline-block; padding: 40px; border-radius: 15px; background: rgba(255,255,255,0.05);">
            <h1 style="color: #4CAF50;">STOP! Verification Required</h1>
            <img src="https://placecats.com/300/200" style="border-radius: 10px; margin: 20px; border: 1px solid #444;">
            <p>You must be 18 or older to view the topics.</p>
            <br>
            <button onclick="window.location.href='/forum'" style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">I am 18+ - ENTER FORUM</button>
        </div>
    </body>
    </html>
  `);
});

// THE MAIN FORUM INDEX
app.get('/forum', (req, res) => {
    // PASTE YOUR 45 TOPIC NAMES INSIDE THE BRACKETS BELOW
    const topics = [
        "Your Topic 1", "Your Topic 2", "Your Topic 3", "Your Topic 4", "Your Topic 5",
        "Your Topic 6", "Your Topic 7", "Your Topic 8", "Your Topic 9", "Your Topic 10",
        "Your Topic 11", "Your Topic 12", "Your Topic 13", "Your Topic 14", "Your Topic 15",
        "Your Topic 16", "Your Topic 17", "Your Topic 18", "Your Topic 19", "Your Topic 20",
        "Your Topic 21", "Your Topic 22", "Your Topic 23", "Your Topic 24", "Your Topic 25",
        "Your Topic 26", "Your Topic 27", "Your Topic 28", "Your Topic 29", "Your Topic 30",
        "Your Topic 31", "Your Topic 32", "Your Topic 33", "Your Topic 34", "Your Topic 35",
        "Your Topic 36", "Your Topic 37", "Your Topic 38", "Your Topic 39", "Your Topic 40",
        "Your Topic 41", "Your Topic 42", "Your Topic 43", "Your Topic 44", "Your Topic 45"
    ];

    let topicListHtml = topics.map((t, i) => `
        <li style="margin-bottom: 10px;">
            <a href="/topic/${i + 1}" style="color: #4CAF50; text-decoration: none; font-weight: bold;">${i + 1}. ${t}</a>
        </li>
    `).join('');

    res.send(`
        <html>
        <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px;">
            <h1 style="color: #4CAF50;">🌌 BSMeSomeMorePlease Forums</h1>
            <hr style="border: 0.5px solid #333;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <ul style="list-style: none; padding: 0;">${topicListHtml}</ul>
            </div>
            <br>
            <button onclick="window.location.href='/'" style="background: #333; color: #888; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Back to Gate</button>
        </body>
        </html>
    `);
});

// INDIVIDUAL TOPIC PAGE (LOADS DYNAMICALLY)
app.get('/topic/:id', async (req, res) => {
    const topicId = req.params.id;
    let messagesHtml = '<p style="color: #666;">No messages yet. Be the first!</p>';
    try {
        const result = await pool.query('SELECT content FROM posts WHERE topic_id = $1 ORDER BY id DESC', [topicId]);
        if (result.rows.length > 0) {
            messagesHtml = result.rows.map(row => `<div style="border-bottom: 1px solid #333; padding: 10px; margin-bottom: 10px;">${row.content}</div>`).join('');
        }
    } catch (err) { console.error(err); }

    res.send(`
        <html>
        <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px;">
            <h1 style="color: #4CAF50;">Topic #${topicId} Discussion</h1>
            <div style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 10px; margin-bottom: 20px;">${messagesHtml}</div>
            <form action="/post/${topicId}" method="POST" style="background: #161b22; padding: 20px; border-radius: 10px; border: 1px solid #30363d; max-width: 600px;">
                <textarea name="content" placeholder="Type your message..." style="width: 100%; height: 80px; background: #0d1117; color: white; border: 1px solid #30363d; padding: 10px;"></textarea>
                <br><br>
                <button type="submit" style="background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Post Message</button>
            </form>
            <br>
            <button onclick="window.location.href='/forum'" style="background: none; border: 1px solid #333; color: #888; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Back to Forum</button>
        </body>
        </html>
    `);
});

app.post('/post/:id', async (req, res) => {
    const topicId = req.params.id;
    const content = req.body.content;
    try { await pool.query('INSERT INTO posts (topic_id, content) VALUES ($1, $2)', [topicId, content]); } catch (err) { console.error(err); }
    res.redirect('/topic/' + topicId);
});

app.listen(port, () => { console.log('Server running on port ' + port); });

app.listen(port, () => {
    console.log('Server running on port ' + port);
});
