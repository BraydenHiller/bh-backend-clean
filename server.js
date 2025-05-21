const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
const clientsFile = path.join(dataDir, 'clients.json');
const selectionsFile = path.join(dataDir, 'selections.json');

// Ensure data directory and files exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(clientsFile)) fs.writeFileSync(clientsFile, '[]');
if (!fs.existsSync(selectionsFile)) fs.writeFileSync(selectionsFile, '[]');

// Load initial data from disk
let clients = JSON.parse(fs.readFileSync(clientsFile));
let selections = JSON.parse(fs.readFileSync(selectionsFile));

// Save helper
const saveToFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Routes

app.get('/', (req, res) => {
  res.send('📸 BH Capture Co backend is running with file persistence');
});

app.get('/clients', (req, res) => {
  res.json(clients);
});

app.post('/clients', (req, res) => {
  const { id, name, password } = req.body;
  if (!id || !name || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (clients.some(c => c.id === id)) {
    return res.status(400).json({ error: 'Client ID already exists' });
  }

  const newClient = { id, name, password, images: [] };
  clients.push(newClient);
  saveToFile(clientsFile, clients);
  res.json(newClient);
});

app.post('/upload', (req, res) => {
  const { id, images } = req.body;
  const client = clients.find(c => c.id === id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found' });
  }

  if (!Array.isArray(client.images)) {
    client.images = [];
  }

  client.images.push(...images);
  saveToFile(clientsFile, clients);
  res.json({ success: true, updated: client.images });
});

app.post('/selections', (req, res) => {
  const { id, selected } = req.body;
  if (!id || !Array.isArray(selected)) {
    return res.status(400).json({ error: 'Invalid selection format' });
  }

  selections = selections.filter(s => s.id !== id);
  selections.push({ id, selected });
  saveToFile(selectionsFile, selections);
  res.json({ success: true });
});

app.get('/selections', (req, res) => {
  res.json(selections);
});

app.post('/update-images', (req, res) => {
  const { id, images } = req.body;
  const client = clients.find(c => c.id === id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  client.images = images;
  saveToFile(clientsFile, clients);
  res.json({ success: true });
});

app.delete('/clients/:id', (req, res) => {
  const { id } = req.params;
  const clientIndex = clients.findIndex(c => c.id === id);
  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }

  clients.splice(clientIndex, 1);
  selections = selections.filter(s => s.id !== id);
  saveToFile(clientsFile, clients);
  saveToFile(selectionsFile, selections);

  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} with file-based storage`));
