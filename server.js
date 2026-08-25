import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store leads in-memory as backup
const leadsStore = [];

// API Endpoint to receive form submission
app.post('/api/submit-lead', async (req, res) => {
  const { name, email, source } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const newLead = {
    name: name.trim(),
    email: email.trim(),
    source: source || 'Digital Lab Landing Page',
    timestamp: new Date().toISOString()
  };

  leadsStore.push(newLead);
  console.log('New Lead Received:', newLead);

  // If GOOGLE_SHEET_SCRIPT_URL is configured in environment, forward the data
  const googleScriptUrl = process.env.GOOGLE_SHEET_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbzxOjbmHjxr5I6GAyYtxoTV568D2mOZATtCfB0j2wqcry1nkfIDLUunFV5d62YBaRo/exec";
  if (googleScriptUrl) {
    try {
      await fetch(googleScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      });
      console.log('Successfully forwarded lead to Google Apps Script');
    } catch (err) {
      console.error('Error forwarding to Google Apps Script:', err.message);
    }
  }

  return res.json({
    status: 'success',
    message: 'Lead received successfully',
    data: newLead
  });
});

// Config endpoint so client can get configured resource URLs
app.get('/api/config', (req, res) => {
  res.json({
    googleScriptUrl: process.env.GOOGLE_SHEET_SCRIPT_URL || '',
    resourceUrl: process.env.RESOURCE_REDIRECT_URL || 'https://drive.google.com'
  });
});

// Serve static files from root directory
app.use(express.static(__dirname));

// Serve index.html for all GET routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
