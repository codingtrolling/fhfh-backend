const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. HARDCODED MONGODB STRING ---
// Replace YOUR_ACTUAL_PASSWORD with your real password!
const MONGO_URI = "mongodb+srv://fhfh-backend:1234yasse@cluster0.kmrytlf.mongodb.net/fhfh_app?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("FhFh Database: Hard-Linked Success"))
    .catch(err => {
        console.log("Database Error Details:", err);
        process.exit(1); // Kill process if DB fails so you see the error in Railway logs
    });

// --- 2. HARDCODED CLOUDINARY ---
// You MUST paste your real keys from Cloudinary here!
cloudinary.config({
    cloud_name: 'your_name',
    api_key: 'your_key',
    api_secret: 'your_secret'
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'fhfh_production', resource_type: 'video' }
});
const upload = multer({ storage });

// --- 3. DATA SCHEMA ---
const Video = mongoose.model('Video', new mongoose.Schema({
    user: String,
    caption: String,
    videoUrl: String,
    likes: { type: Number, default: 0 },
    avatar: String,
    createdAt: { type: Date, default: Date.now }
}));

// --- 4. ROUTES ---
app.get('/api/feed', async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: -1 });
        res.json(videos);
    } catch (e) { res.status(500).json(e); }
});

app.post('/api/upload', upload.single('video'), async (req, res) => {
    try {
        const newVid = new Video({
            user: req.body.user || "@anonymous",
            caption: req.body.caption,
            videoUrl: req.file.path,
            avatar: `https://i.pravatar.cc/150?u=${Math.random()}`
        });
        await newVid.save();
        res.json(newVid);
    } catch (e) { res.status(500).json({ error: "Upload failed" }); }
});

// --- 5. RAILWAY PORT ---
const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`FhFh Server running on ${PORT}`));
