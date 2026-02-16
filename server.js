const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- CONFIG ---
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("FhFh DB Connected"))
  .catch(err => console.error("DB Connection Failed", err));

const videoSchema = new mongoose.Schema({
    user: String,
    caption: String,
    videoUrl: String,
    likes: { type: Number, default: 0 },
    avatar: String,
    createdAt: { type: Date, default: Date.now }
});
const Video = mongoose.model('Video', videoSchema);

// --- CLOUDINARY CONFIG ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'fhfh_main', resource_type: 'video' }
});
const upload = multer({ storage });

// --- ROUTES ---
app.get('/api/feed', async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 });
        res.json(videos);
    } catch (e) { res.status(500).send(e); }
});

app.post('/api/upload', upload.single('video'), async (req, res) => {
    const newVideo = new Video({
        user: req.body.user || "@user" + Math.floor(Math.random()*100),
        caption: req.body.caption || "FhFh Tool 11",
        videoUrl: req.file.path,
        avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
    });
    await newVideo.save();
    res.json(newVideo);
});

// --- LISTEN ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
