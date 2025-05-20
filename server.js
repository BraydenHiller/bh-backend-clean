const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(express.json());

let clients = [];
let selections = [];

app.get('/', (req, res) => {
  res.send('📸 BH Backend API running (memory mode)');
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
  res.json({ success: true, updated: client.images });
});

// ✅ FIXED: Renamed from `/select` to `/selections`
app.post('/selections', (req, res) => {
  const { id, selected } = req.body;
  if (!id || !Array.isArray(selected)) {
    return res.status(400).json({ error: 'Invalid selection format' });
  }

  selections = selections.filter(s => s.id !== id);
  selections.push({ id, selected });
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

  res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ Memory-mode server running on port ${PORT}`));
