const express = require('express');
const cors = require('cors');
const db = require('./db');
const worker = require('./worker');

const app = express();
app.use(cors());
app.use(express.json());

// Add a site
app.post('/sites', (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL required" });

  db.run("INSERT INTO sites (url) VALUES (?)", [url], function(err) {
    if (err) return res.status(500).send(err);
    res.json({ id: this.lastID, url });
  });
});

// Get all sites
app.get('/sites', (req, res) => {
  db.all("SELECT * FROM sites", [], (err, rows) => {
    if (err) return res.status(500).send(err);
    res.json(rows);
  });
});

// Get last 20 checks for a site
app.get('/checks/:id', (req, res) => {
  db.all(
    "SELECT * FROM checks WHERE site_id = ? ORDER BY created_at DESC LIMIT 20",
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).send(err);
      res.json(rows);
    }
  );
});

app.listen(3000, () => {
  console.log('🚀 UptimeLite running on http://localhost:3000');
});

// Start monitoring
worker.start();