const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://bossibilities.onrender.com']
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Serve static files except protected directory
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        if (path.includes('protected')) {
            res.status(403).end();
            return;
        }
    }
}));

// Routes for static pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'contact.html'));
});

app.get('/ebook', (req, res) => {
    res.sendFile(path.join(__dirname, 'ebook.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.get('/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'history.html'));
});

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Protected ebook download route
app.get('/api/ebook/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        console.log('Attempting to download book:', bookId);
        
        // Here we would verify the purchase using Stripe's API
        // For now, we'll just serve the file
        const filePath = path.join(__dirname, 'protected', 'mens-7-day-mental-ebook-final3.pdf');
        res.download(filePath);
    } catch (error) {
        console.error('Error in /api/ebook/:bookId:', error);
        res.status(500).json({ 
            error: 'Failed to download file',
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        res.status(200).json({
            status: 'OK',
            services: {
                api: 'Running'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            services: {
                api: error.message
            },
            timestamp: new Date().toISOString()
        });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
