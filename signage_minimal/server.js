// Minimal signage server
// Requirements: set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars
const express = require('express');
const http = require('http');
const multer = require('multer');
const cors = require('cors');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cloudinary config from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// in-memory mapping screenId -> { url, resource_type, timestamp }
const screens = {};
const SCREEN_IDS = ['screen-1','screen-2','screen-3','screen-4','screen-5'];

// initialize screens empty
SCREEN_IDS.forEach(id => screens[id] = { url: '', resource_type: '', ts: 0 });

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 1024 } });

app.get('/api/screens', (req, res) => {
  // simple single-location app but with multiple screen ids
  const locations = [{ id: 'loc-1', name: 'All Screens', screens: SCREEN_IDS.map(id=>({id, name: id})) }];
  res.json({ locations, screens });
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  (async ()=>{
    try {
      const { screenId } = req.body;
      if(!screenId || !screens[screenId]) return res.status(400).json({ error: 'invalid screenId' });
      if(!req.file) return res.status(400).json({ error: 'no file' });
      const buffer = req.file.buffer;
      const uploadStream = cloudinary.uploader.upload_stream({ folder: `signage/${screenId}`, resource_type: 'auto' }, (error, result)=>{
        if(error){ console.error('Cloud upload error', error); return res.status(500).json({ error: 'upload failed' }); }
        screens[screenId] = { url: result.secure_url, resource_type: result.resource_type || 'image', ts: Date.now() };
        // emit update to that screen room
        io.to(screenId).emit('screen:update', { screenId, url: result.secure_url, resource_type: result.resource_type });
        return res.json({ ok: true, url: result.secure_url });
      });
      streamifier.createReadStream(buffer).pipe(uploadStream);
    } catch(err){
      console.error(err);
      res.status(500).json({ error: 'server error' });
    }
  })();
});

app.get('/api/screen/:screenId', (req, res) => {
  const s = screens[req.params.screenId];
  if(!s) return res.status(404).json({ error: 'not found' });
  res.json(s);
});

io.on('connection', socket => {
  console.log('socket connected', socket.id);
  socket.on('join', ({ screenId }) => {
    if(!screenId || !screens[screenId]) return;
    socket.join(screenId);
    // send current
    socket.emit('screen:update', { screenId, url: screens[screenId].url, resource_type: screens[screenId].resource_type });
  });
  socket.on('disconnect', ()=>{});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, ()=> console.log('Listening on', PORT));
