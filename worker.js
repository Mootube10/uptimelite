const axios = require('axios');
const db = require('./db');

async function checkSite(site) {
  const start = Date.now();

  try {
    const res = await axios.get(site.url, { timeout: 5000 });
    const latency = Date.now() - start;

    db.run(
      "INSERT INTO checks (site_id, status, latency) VALUES (?, ?, ?)",
      [site.id, res.status, latency]
    );

    console.log(`🟢 OK: ${site.url} (${latency}ms)`);
  } catch {
    const latency = Date.now() - start;

    db.run(
      "INSERT INTO checks (site_id, status, latency) VALUES (?, ?, ?)",
      [site.id, 500, latency]
    );

    console.log(`🔴 DOWN: ${site.url}`);
  }
}

function start() {
  setInterval(() => {
    db.all("SELECT * FROM sites", [], (err, sites) => {
      if (err) return console.error(err);
      sites.forEach(checkSite);
    });
  }, 60000); // every 60 seconds
}

module.exports = { start };