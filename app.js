const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

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
    const topics = [
        "Announcements & Rules", "New Member Introductions", "General Lounge Chat", "Suggestion Box", "Help & Support",
        "Cute Photo Gallery", "Adoption Resources", "Training Tips", "Health & Nutrition", "Senior Cat Care",
        "Indoor Gardening", "Strains & Reviews", "Chill Music Playlists", "Philosophy & Deep Thoughts", "Midnight Snacks & Recipes",
        "PC Master Race", "Console War Zone", "Indie Game Gems", "Coding & Web Dev", "AI & Future Tech",
        "Digital Illustration", "Photography", "Writing & Poetry", "Music Production", "DIY Crafts",
        "Movies & Cinema", "Anime & Manga", "TV Series Binging", "Book Club", "Podcast Recommendations",
        "Astronomy & NASA News", "Physics Explored", "Biology & Nature", "History Mysteries", "Future of Humanity",
        "Travel Stories", "Fitness & Health", "Mental Wellness", "Fashion & Style", "Financial Freedom",
        "Unpopular Opinions", "Paranormal & Cryptids", "Conspiracy Corner", "Meme Repository", "The Void"
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
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                <ul style="list-style: none; padding: 0;">${topicListHtml}</ul>
            </div>
            <br>
            <button onclick="window.location.href='/'" style="background: #333; color: #888; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Back to Gate</button>
        </body>
        </html>
    `);
});

// THE INDIVIDUAL TOPIC PAGE (DYNAMIC)
app.get('/topic/:id', (req, res) => {
    res.send(`
        <html>
        <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px; text-align: center;">
            <h1 style="color: #4CAF50;">Topic #${req.params.id}</h1>
            <div style="border: 1px solid #333; padding: 50px; border-radius: 10px; background: rgba(255,255,255,0.02);">
                <p>Welcome to the discussion for this section.</p>
                <p style="color: #666;">[ Post Database Loading... ]</p>
            </div>
            <br>
            <button onclick="window.location.href='/forum'" style="background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Return to Forum List</button>
        </body>
        </html>
    `);
});

app.listen(port, () => {
    console.log('Server is running on port ' + port);
});
