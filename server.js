const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. STORAGE CONFIG ---
const storage = multer.diskStorage({
    destination: './public/videos/',
    filename: (req, file, cb) => cb(null, `fhfh-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// --- 2. MOCK DATABASE ---
let videoFeed = [
    { id: 1, user: '@troll_coder', likes: 1200, caption: 'Tool 11 is live!', src: 'demo1.mp4' },
    { id: 2, user: '@gh_mod', likes: 5000, caption: 'POV: Empty block list', src: 'demo2.mp4' }
];

// --- 3. STREAMING ENGINE (Range Header Support) ---
app.get('/video/:filename', (req, res) => {
    const videoPath = path.join(__dirname, 'public/videos', req.params.filename);
    const videoSize = fs.statSync(videoPath).size;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : videoSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${videoSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(206, head);
        file.pipe(res);
    } else {
        const head = {
            'Content-Length': videoSize,
            'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
    }
});

// --- 4. API ENDPOINTS ---
app.get('/api/feed', (req, res) => {
    res.json(videoFeed);
});

app.post('/api/upload', upload.single('video'), (req, res) => {
    const newVideo = {
        id: videoFeed.length + 1,
        user: req.body.user || '@anonymous',
        likes: 0,
        caption: req.body.caption,
        src: req.file.filename
    };
    videoFeed.unshift(newVideo);
    res.status(201).json(newVideo);
});

app.listen(3000, () => console.log('FhFh Server running on port 3000'));

