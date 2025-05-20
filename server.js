const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

const clientsPath = path.join(__dirname, 'clients.json');
const selectionsPath = path.join(__dirname, 'selections.json');

app.use(cors());
app.use(express.json());

function readJSON(file) {
  return JSON.parse(fs.existsSync(file) ? fs.readFileSync(file, 'utf-8') : '[]');
}

function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ✅ Root route (optional)
app.get('/', (req, res) => {
  res.send('📸 BH Backend API is running!');
});

// GET clients
app.get('/clients', (req, res) => {
  res.json(readJSON(clientsPath));
});

// POST create client
app.post('/clients', (req, res) => {
  const { id, name, password } = req.body;
  if (!id || !name || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const clients = readJSON(clientsPath);
  if (clients.some(c => c.id === id)) {
    return res.status(400).json({ error: 'Client ID already exists' });
  }

  const newClient = { id, name, password, images: [] };
  clients.push(newClient);
  writeJSON(clientsPath, clients);
  res.json(newClient);
});

// POST upload images (simulate)
app.post('/upload', (req, res) => {
  const { id, images } = req.body;
  const clients = readJSON(clientsPath);
  const client = clients.find(c => c.id === id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  client.images = [...client.images, ...images];
  writeJSON(clientsPath, clients);
  res.json({ success: true });
});

// POST save selections
app.post('/select', (req, res) => {
  const { id, selected } = req.body;
  const selections = readJSON(selectionsPath);
  const updated = selections.filter(s => s.id !== id);
  updated.push({ id, selected });
  writeJSON(selectionsPath, updated);
  res.json({ success: true });
});

// GET all selections
app.get('/selections', (req, res) => {
  res.json(readJSON(selectionsPath));
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
