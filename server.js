const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const LINKS_FILE = path.join(__dirname, 'links.json');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Create links.json if it doesn't exist
if (!fs.existsSync(LINKS_FILE)) fs.writeFileSync(LINKS_FILE, '{}');

// Get all links
app.get('/api/links', (req, res) => {
    const links = JSON.parse(fs.readFileSync(LINKS_FILE));
    res.json(links);
});

// Create a new short link
app.post('/api/links', (req, res) => {
    const url = req.body.url;
    if (!url) return res.status(400).json({ error: 'No URL provided' });

    const code = Math.random().toString(36).substring(2, 8); // short 6-char code
    const links = JSON.parse(fs.readFileSync(LINKS_FILE));
    links[code] = { original_url: url, clicks: 0, last_clicked: null };
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));

    res.json({ code, original_url: url, short_url: `http://localhost:${PORT}/${code}`, clicks: 0, last_clicked: null });
});

// Redirect short link
app.get('/:code', (req, res) => {
    const code = req.params.code;
    const links = JSON.parse(fs.readFileSync(LINKS_FILE));
    if (!links[code]) return res.status(404).send('Link not found');

    links[code].clicks += 1;
    links[code].last_clicked = new Date().toISOString();
    fs.writeFileSync(LINKS_FILE, JSON.stringify(links, null, 2));

    res.redirect(links[code].original_url);
});

app.listen(PORT, () => console.log(`TinyLink running at http://localhost:${PORT}`));
