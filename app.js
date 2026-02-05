const express = require('express');
const session = require('express-session'); // NEW: This remembers the user
const { Pool } = require('pg');
const app = express();
const port = process.env.PORT || 10000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// 1. SET UP THE SESSION (The "Memory" of the site)
app.use(session({
  secret: 'bsme-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.use(express.urlencoded({ extended: true }));

// 2. THE GATEKEEPER FUNCTION
const checkAge = (req, res, next) => {
  if (req.session.isAdult) {
    next(); // They clicked the button, let them through
  } else {
    res.redirect('/'); // Not verified? Kick them back to the gate
  }
};

// THE AGE GATE PAGE
app.get('/', (req, res) => {
  res.send(`
    <html>
    <body style="background-color: #0b0e14; color: white; text-align: center; font-family: sans-serif; padding-top: 100px;">
        <div style="border: 2px solid #333; display: inline-block; padding: 40px; border-radius: 15px; background: rgba(255,255,255,0.05);">
            <h1 style="color: #4CAF50;">STOP! Verification Required</h1>
            <img src="https://placecats.com/300/200" style="border-radius: 10px; margin: 20px; border: 1px solid #444;">
            <p>You must be 18 or older to view the topics.</p>
            <br>
            <form action="/verify-age" method="POST">
                <button type="submit" style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">I am 18+ - ENTER FORUM</button>
            </form>
        </div>
    </body>
    </html>
  `);
});

// ACTION: VERIFY AGE
app.post('/verify-age', (req, res) => {
  req.session.isAdult = true; // Set the "Memory" to true
  res.redirect('/forum');
});

// THE MAIN FORUM INDEX (Now Protected by checkAge)
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
            <h1 style="color: #4CAF50;">🌌 BSMeSomeMorePlease Forums</h1>
            <hr style="border: 0.5px solid #333;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <ul style="list-style: none; padding: 0;">${topicListHtml}</ul>
            </div>
        </body>
        </html>
    `);
});

// Protect Topic Pages too
app.get('/topic/:id', checkAge, async (req, res) => {
    // ... (rest of your topic code from before)
});

app.listen(port, () => { console.log('Server running on port ' + port); });
