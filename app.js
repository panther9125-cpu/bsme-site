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

// DATABASE STRUCTURE CHECK (Adding Heading Column)
pool.query(`
  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    topic_id INT,
    heading TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ALTER TABLE posts ADD COLUMN IF NOT EXISTS heading TEXT;
  ALTER TABLE posts ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
`).then(() => console.log("Database structure updated with headings!"))
  .catch(err => console.error("Database error:", err));

const checkAge = (req, res, next) => {
  if (req.session.isAdult) { next(); } 
  else { res.redirect('/'); }
};

// ... [AGE GATE, LOGIN, AND LOGOUT ROUTES REMAIN THE SAME] ...

// FORUM INDEX WITH COUNTS
app.get('/forum', checkAge, async (req, res) => {
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

    try {
        const counts = await pool.query('SELECT topic_id, COUNT(*) as total FROM posts GROUP BY topic_id');
        const countMap = {};
        counts.rows.forEach(r => countMap[r.topic_id] = r.total);

        let topicListHtml = topics.map((t, i) => {
            const topicNum = i + 1;
            const msgCount = countMap[topicNum] || 0;
            return `
                <li style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; padding-right: 20px;">
                    <a href="/topic/${topicNum}" style="color: #4CAF50; text-decoration: none; font-weight: bold;">${topicNum}. ${t}</a>
                    <span style="background: #333; color: #888; font-size: 0.7em; padding: 2px 8px; border-radius: 10px;">${msgCount} posts</span>
                </li>
            `;
        }).join('');

        res.send(`
            <html>
            <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h1 style="color: #4CAF50;">🌌 BSMeSomeMorePlease Forums</h1>
                    <div>
                        ${req.session.user ? `<span style="color: #888; margin-right: 15px;">User: <b>${req.session.user}</b></span> <a href="/logout" style="color: #f44336; text-decoration: none;">Logout</a>` : `<a href="/login" style="color: #888; text-decoration: none;">Admin Login</a>`}
                    </div>
                </div>
                <hr style="border: 0.5px solid #333; margin-bottom: 30px;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px 40px;">
                    <ul style="list-style: none; padding: 0;">${topicListHtml}</ul>
                </div>
            </body>
            </html>
        `);
    } catch (err) { console.error(err); res.send("Error loading forum."); }
});

// TOPIC PAGE (Showing Headings)
app.get('/topic/:id', checkAge, async (req, res) => {
    const topicId = req.params.id;
    const isAdmin = (req.session.user === 'Ghostrider' || req.session.user === 'Boobs');
    let messagesHtml = '<p style="color: #666;">No messages yet.</p>';
    try {
        const result = await pool.query("SELECT id, heading, content, TO_CHAR(created_at, 'Mon DD, HH:MI AM') as time FROM posts WHERE topic_id = $1 ORDER BY id DESC", [topicId]);
        if (result.rows.length > 0) {
            messagesHtml = result.rows.map(row => `
                <div style="border-bottom: 1px solid #333; padding: 15px; margin-bottom: 15px; background: rgba(255,255,255,0.02); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <h3 style="color: #4CAF50; margin: 0 0 10px 0;">${row.heading || 'No Heading'}</h3>
                        <div>
                            <span style="color: #888; font-size: 0.75em;">${row.time}</span>
                            ${isAdmin ? `<form action="/delete-post/${row.id}" method="POST" style="display: inline; margin-left: 10px;"><input type="hidden" name="topicId" value="${topicId}"><button type="submit" style="background: none; border: none; color: #f44336; cursor: pointer; font-size: 0.8em;">[Delete]</button></form>` : ''}
                        </div>
                    </div>
                    <div style="color: #ccc; line-height: 1.5;">${row.content}</div>
                </div>
            `).join('');
        }
    } catch (err) { console.error(err); }

    const postBox = (topicId === "1" && !isAdmin) 
        ? `<p style="color: #f44336; font-weight: bold;">[ READ ONLY: Only Ghostrider and Boobs can post here ]</p>`
        : `<form action="/post/${topicId}" method="POST" style="background: #161b22; padding: 20px; border-radius: 10px; border: 1px solid #30363d; max-width: 600px;">
                <input type="text" name="heading" placeholder="Post Heading" style="width: 100%; padding: 10px; margin-bottom: 10px; background: #0d1117; color: white; border: 1px solid #30363d; border-radius: 5px;"><br>
                <textarea name="content" placeholder="Type your message..." style="width: 100%; height: 100px; background: #0d1117; color: white; border: 1px solid #30363d; padding: 10px; border-radius: 5px;"></textarea>
                <br><br>
                <button type="submit" style="background: #238636; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">Post Message</button>
           </form>`;

    res.send(`
        <html>
        <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px;">
            <h1 style="color: #4CAF50;">Topic #${topicId}</h1>
            <div style="margin-bottom: 30px;">${messagesHtml}</div>
            ${postBox}
            <br>
            <button onclick="window.location.href='/forum'" style="background: none; border: 1px solid #333; color: #888; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Back to Forum</button>
        </body>
        </html>
    `);
});

// [DELETE AND POST ACTIONS UPDATED FOR HEADING]
app.post('/post/:id', async (req, res) => {
    const isAdmin = (req.session.user === 'Ghostrider' || req.session.user === 'Boobs');
    if (req.params.id === "1" && !isAdmin) { return res.redirect('/topic/1'); }
    try { 
        await pool.query('INSERT INTO posts (topic_id, heading, content) VALUES ($1, $2, $3)', [req.params.id, req.body.heading, req.body.content]); 
    } catch (err) { console.error(err); }
    res.redirect('/topic/' + req.params.id);
});

// ... [DELETE AND LISTEN ROUTES REMAIN THE SAME] ...
