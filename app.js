const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>BSMeSomeMorePlease - Verification</title>
        <style>
            body { background-color: #0b0e14; color: #e0e0e0; font-family: Arial, sans-serif; text-align: center; padding-top: 50px; }
            .kitten-container { border: 2px solid #333; display: inline-block; padding: 20px; background: rgba(255, 255, 255, 0.05); border-radius: 15px; }
            .btn { background-color: #4CAF50; border: none; color: white; padding: 15px 32px; font-size: 16px; margin: 10px; cursor: pointer; border-radius: 5px; }
            .btn-exit { background-color: #f44336; }
        </style>
    </head>
    <body>
        <div class="kitten-container">
            <h1>STOP! Verification Required</h1>
            <p>You must be 18+ to view the forum topics.</p>
            <img src="https://placekitten.com/300/200" alt="Security Kitten" style="border-radius: 10px; margin: 20px 0;">
            <br>
            <button class="btn" onclick="alert('Entering Forum...')">I am 18 or older - Enter</button>
            <button class="btn btn-exit" onclick="alert('Access Denied')">I am under 18 - Exit</button>
        </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
