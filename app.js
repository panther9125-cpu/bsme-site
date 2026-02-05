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
app.get('/forum', (req, res) => {
  res.send(`
    <html>
    <body style="background-color: #0b0e14; color: white; font-family: sans-serif; padding: 40px; line-height: 1.6;">
        <h1 style="color: #4CAF50;">🌌 BSMeSomeMorePlease Forums</h1>
        <p><i>The inner circle is now open.</i></p>
        <hr style="border: 0.5px solid #333;">

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
                <h3 style="color: #4CAF50;">🏠 The Lobby</h3>
                <ul>
                    <li>1. Announcements & Rules</li>
                    <li>2. New Member Introductions</li>
                    <li>3. General Lounge Chat</li>
                    <li>4. Suggestion Box</li>
                    <li>5. Help & Support</li>
                </ul>

                <h3 style="color: #4CAF50;">🐱 Kitten Corner</h3>
                <ul>
                    <li>6. Cute Photo Gallery</li>
                    <li>7. Adoption Resources</li>
                    <li>8. Training Tips</li>
                    <li>9. Health & Nutrition</li>
                    <li>10. Senior Cat Care</li>
                </ul>

                <h3 style="color: #4CAF50;">🍃 The Greenhouse</h3>
                <ul>
                    <li>11. Indoor Gardening</li>
                    <li>12. Strains & Reviews</li>
                    <li>13. Chill Music Playlists</li>
                    <li>14. Philosophy & Deep Thoughts</li>
                    <li>15. Midnight Snacks & Recipes</li>
                </ul>

                <h3 style="color: #4CAF50;">🎮 Gaming & Tech</h3>
                <ul>
                    <li>16. PC Master Race</li>
                    <li>17. Console War Zone</li>
                    <li>18. Indie Game Gems</li>
                    <li>19. Coding & Web Dev</li>
                    <li>20. AI & Future Tech</li>
                </ul>
                
                <h3 style="color: #4CAF50;">🎨 Creative Arts</h3>
                <ul>
                    <li>21. Digital Illustration</li>
                    <li>22. Photography</li>
                    <li>23. Writing & Poetry</li>
                    <li>24. Music Production</li>
                    <li>25. DIY Crafts</li>
                </ul>
            </div>

            <div>
                <h3 style="color: #4CAF50;">🎬 Entertainment</h3>
                <ul>
                    <li>26. Movies & Cinema</li>
                    <li>27. Anime & Manga</li>
                    <li>28. TV Series Binging</li>
                    <li>29. Book Club</li>
                    <li>30. Podcast Recommendations</li>
                </ul>

                <h3 style="color: #4CAF50;">🚀 Science & Space</h3>
                <ul>
                    <li>31. Astronomy & NASA News</li>
                    <li>32. Physics Explored</li>
                    <li>33. Biology & Nature</li>
                    <li>34. History Mysteries</li>
                    <li>35. Future of Humanity</li>
                </ul>

                <h3 style="color: #4CAF50;">🌍 Lifestyle</h3>
                <ul>
                    <li>36. Travel Stories</li>
                    <li>37. Fitness & Health</li>
                    <li>38. Mental Wellness</li>
                    <li>39. Fashion & Style</li>
                    <li>40. Financial Freedom</li>
                </ul>

                <h3 style="color: #4CAF50;">🔥 The After Hours</h3>
                <ul>
                    <li>41. Unpopular Opinions</li>
                    <li>42. Paranormal & Cryptids</li>
                    <li>43. Conspiracy Corner</li>
                    <li>44. Meme Repository</li>
                    <li>45. The Void (Randomness)</li>
                </ul>
            </div>
        </div>

        <br>
        <button onclick="window.location.href='/'" style="background: #333; color: #888; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Back to Gate</button>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log('Server is running on port ' + port);
});
