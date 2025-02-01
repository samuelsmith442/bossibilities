const express = require('express');
const path = require('path');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf
    }
}));
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

// Store successful payments temporarily (in production, use a database)
const successfulPayments = new Set();

// Success page with download link
app.get('/success', async (req, res) => {
    const sessionId = req.query.session_id;
    
    try {
        if (!sessionId) {
            return res.redirect('/');
        }

        // Verify the session with Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
            // Store the session ID for download
            successfulPayments.add(sessionId);
            res.sendFile(path.join(__dirname, 'success.html'));
        } else {
            res.redirect('/');
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.redirect('/');
    }
});

// Protected ebook download route
app.get('/api/ebook/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Verify the session with Stripe again
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status !== 'paid') {
            return res.status(403).json({ error: 'Payment verification failed' });
        }

        // Remove the session ID after successful download
        successfulPayments.delete(sessionId);
        
        const filePath = path.join(__dirname, 'protected', 'mens-7-day-mental-ebook-final3.pdf');
        res.download(filePath);
    } catch (error) {
        console.error('Error in /api/ebook/:sessionId:', error);
        res.status(500).json({ 
            error: 'Failed to download file',
            details: error.message 
        });
    }
});

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
