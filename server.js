const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DB_FILE = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function getDB() {
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// 1. GET /api/sync
app.get('/api/sync', (req, res) => {
  const db = getDB();
  res.json({
    event: db.event,
    announcements: db.announcements,
    schedule: db.schedule,
    stands: db.stands,
    participantsCount: db.participants.length,
    timestamp: new Date().toLocaleTimeString()
  });
});

// 2. POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { pin } = req.body;
  let role = null;
  let name = '';

  if (pin === '1234') { role = 'admin'; name = 'Organizador Principal'; }
  else if (pin === '2026') { role = 'stage_manager'; name = 'Coordinador de Escenarios'; }
  else if (pin === '7777') { role = 'stand_operator'; name = 'Operador de Stand'; }

  if (role) {
    res.json({ success: true, role, name, token: `tk_${pin}` });
  } else {
    res.status(401).json({ success: false, message: 'PIN incorrecto' });
  }
});

// =============================================================================
// 3. SCHEDULE CRUD (Shows)
// =============================================================================
app.get('/api/schedule', (req, res) => {
  res.json(getDB().schedule);
});

app.post('/api/schedule', (req, res) => {
  const db = getDB();
  const newShow = {
    id: `ev-${Math.floor(100 + Math.random() * 900)}`,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    stageId: req.body.stageId || 'main',
    stageName: req.body.stageName || 'Escenario Principal',
    category: req.body.category || 'masterclass',
    title: req.body.title,
    speaker: req.body.speaker,
    speakerAvatar: req.body.speakerAvatar || '👨‍🍳',
    description: req.body.description,
    badge: req.body.badge || 'Show Especial',
    status: req.body.status || 'scheduled'
  };
  db.schedule.push(newShow);
  saveDB(db);
  res.json({ success: true, created: newShow });
});

app.put('/api/schedule/:id', (req, res) => {
  const db = getDB();
  const item = db.schedule.find(s => s.id === req.params.id);
  if (item) {
    Object.assign(item, req.body);
    saveDB(db);
    res.json({ success: true, updated: item });
  } else {
    res.status(404).json({ success: false, message: 'Show no encontrado' });
  }
});

app.delete('/api/schedule/:id', (req, res) => {
  const db = getDB();
  db.schedule = db.schedule.filter(s => s.id !== req.params.id);
  saveDB(db);
  res.json({ success: true, message: 'Show eliminado' });
});

// =============================================================================
// 4. STANDS CRUD
// =============================================================================
app.get('/api/stands', (req, res) => {
  res.json(getDB().stands);
});

app.post('/api/stands', (req, res) => {
  const db = getDB();
  const newStand = {
    id: `st-${Math.floor(10 + Math.random() * 90)}`,
    number: req.body.number,
    name: req.body.name,
    category: req.body.category || 'carnes',
    categoryName: req.body.categoryName || 'Gastronomía General',
    zone: req.body.zone || 'Sector Central',
    priceRange: req.body.priceRange || '$$',
    rating: '5.0 ⭐',
    image: req.body.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
    fallbackEmoji: req.body.fallbackEmoji || '🍽️',
    featuredDish: req.body.featuredDish,
    tags: req.body.tags || ['Especialidad Gourmet'],
    isGlutenFree: Boolean(req.body.isGlutenFree),
    isVegan: Boolean(req.body.isVegan),
    menu: []
  };
  db.stands.push(newStand);
  saveDB(db);
  res.json({ success: true, created: newStand });
});

app.put('/api/stands/:id', (req, res) => {
  const db = getDB();
  const stand = db.stands.find(s => s.id === req.params.id);
  if (stand) {
    Object.assign(stand, req.body);
    saveDB(db);
    res.json({ success: true, updated: stand });
  } else {
    res.status(404).json({ success: false, message: 'Stand no encontrado' });
  }
});

app.delete('/api/stands/:id', (req, res) => {
  const db = getDB();
  db.stands = db.stands.filter(s => s.id !== req.params.id);
  saveDB(db);
  res.json({ success: true, message: 'Stand eliminado' });
});

// =============================================================================
// 5. STAND MENU CRUD (Platos)
// =============================================================================
app.post('/api/stands/:id/menu', (req, res) => {
  const db = getDB();
  const stand = db.stands.find(s => s.id === req.params.id);
  if (!stand) return res.status(404).json({ success: false, message: 'Stand no encontrado' });

  const newDish = {
    id: `m-${Math.floor(100 + Math.random() * 900)}`,
    item: req.body.item,
    desc: req.body.desc,
    price: req.body.price,
    isSoldOut: Boolean(req.body.isSoldOut)
  };
  stand.menu.push(newDish);
  saveDB(db);
  res.json({ success: true, stand, created: newDish });
});

app.put('/api/stands/:id/menu', (req, res) => {
  const db = getDB();
  const stand = db.stands.find(s => s.id === req.params.id);
  if (!stand) return res.status(404).json({ success: false, message: 'Stand no encontrado' });

  const menuItem = stand.menu.find(m => m.id === req.body.menuId || m.item === req.body.item);
  if (!menuItem) return res.status(404).json({ success: false, message: 'Plato no encontrado' });

  if (req.body.item) menuItem.item = req.body.item;
  if (req.body.desc) menuItem.desc = req.body.desc;
  if (req.body.price) menuItem.price = req.body.price;
  if (req.body.isSoldOut !== undefined) menuItem.isSoldOut = Boolean(req.body.isSoldOut);

  saveDB(db);
  res.json({ success: true, stand, updated: menuItem });
});

app.delete('/api/stands/:id/menu/:menuId', (req, res) => {
  const db = getDB();
  const stand = db.stands.find(s => s.id === req.params.id);
  if (!stand) return res.status(404).json({ success: false, message: 'Stand no encontrado' });

  stand.menu = stand.menu.filter(m => m.id !== req.params.menuId && m.item !== req.params.menuId);
  saveDB(db);
  res.json({ success: true, stand, message: 'Plato eliminado' });
});

// =============================================================================
// 6. ANNOUNCEMENTS CRUD
// =============================================================================
app.post('/api/announcements', (req, res) => {
  const db = getDB();
  const newAnn = {
    id: `ann-${Math.floor(1000 + Math.random() * 9000)}`,
    type: req.body.type || 'alert',
    icon: req.body.icon || '📢',
    title: req.body.title,
    message: req.body.message,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    active: true
  };
  db.announcements.push(newAnn);
  saveDB(db);
  res.json({ success: true, announcement: newAnn });
});

app.delete('/api/announcements/:id', (req, res) => {
  const db = getDB();
  db.announcements = db.announcements.filter(a => a.id !== req.params.id);
  saveDB(db);
  res.json({ success: true, message: 'Aviso eliminado' });
});

// =============================================================================
// 7. RAFFLE & CSV EXPORT
// =============================================================================
app.post('/api/raffle/register', (req, res) => {
  const db = getDB();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const entry = {
    code: `GF-${randomNum}`,
    name: req.body.name,
    phone: req.body.phone,
    stand: req.body.stand || 'GastroFest 2026',
    issuedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  db.participants.push(entry);
  saveDB(db);
  res.json({ success: true, ticket: entry });
});

app.delete('/api/raffle/participants/:code', (req, res) => {
  const db = getDB();
  db.participants = db.participants.filter(p => p.code !== req.params.code);
  saveDB(db);
  res.json({ success: true, message: 'Participante eliminado' });
});

app.get('/api/raffle/participants', (req, res) => {
  res.json(getDB().participants);
});

app.get('/api/raffle/export', (req, res) => {
  const db = getDB();
  let csv = 'Codigo,Nombre,Telefono,Stand_Favorito,Hora_Registro\r\n';
  db.participants.forEach(p => {
    csv += `${p.code},"${p.name}","${p.phone}","${p.stand}",${p.issuedAt}\r\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=gastrofest_participantes.csv');
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`🍔 GastroFest Node.js Backend listening on port ${PORT}`);
});
