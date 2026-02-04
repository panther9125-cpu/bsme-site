const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

// AGE GATE (HOME PAGE)
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

// FORUM PAGE (THE DESTINATION)
app.get('/forum', (req, res) => {
  res.send(`
    <html>
    <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px;">
        <h1 style="color: #4CAF50;">BSMeSomeMorePlease Forums</h1>
        <hr style="border: 0.5px solid #333;">
        <h3>Your 45 Topics:</h3>
        <ul>
            <li>Topic 1: General Discussion</li>
            <li>Topic 2: Kitten Support</li>
        </ul>
        <button onclick="window.location.href='/'" style="margin-top: 20px; background: none; border: 1px solid #444; color: #888; cursor: pointer;">Back to Gate</button>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
