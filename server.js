const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT; // ✅ Required by Render

app.use(cors());
app.use(express.json());

// 🔧 In-memory store
let clients = [];
let selections = [];

// Root route
app.get('/', (req, res) => {
  res.send('📸 BH Backend API running (memory mode)');
});

// GET all clients
app.get('/clients', (req, res) => {
  res.json(clients);
});

// POST create client
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
  res.json(newClient);
});

// POST upload images
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
  res.json({ success: true, updated: client.images });
});

// POST save selections
app.post('/select', (req, res) => {
  const { id, selected } = req.body;
  selections = selections.filter(s => s.id !== id);
  selections.push({ id, selected });
  res.json({ success: true });
});

// GET all selections
app.get('/selections', (req, res) => {
  res.json(selections);
});

// POST update image list
app.post('/update-images', (req, res) => {
  const { id, images } = req.body;
  const client = clients.find(c => c.id === id);
  if (!client) return res.status(404).json({ error: 'Client not found' });

  client.images = images;
  res.json({ success: true });
});

// DELETE client
app.delete('/clients/:id', (req, res) => {
  const { id } = req.params;
  const clientIndex = clients.findIndex(c => c.id === id);
  if (clientIndex === -1) {
    return res.status(404).json({ error: 'Client not found' });
  }

  clients.splice(clientIndex, 1);
  selections = selections.filter(s => s.id !== id);

  res.json({ success: true });
});

// START SERVER
app.listen(PORT, () => console.log(`✅ Memory-mode server running on port ${PORT}`));
