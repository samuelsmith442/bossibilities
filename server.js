const express = require('express');
const path = require('path');
const cors = require('cors');
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://bossibilities.com', 'https://www.bossibilities.com', 'https://test.bossibilities.com']
        : 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Configure AWS
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
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

app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// S3 ebook download route
app.get('/api/ebook/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        console.log('Attempting to download book:', bookId);
        console.log('AWS Config:', {
            region: process.env.AWS_REGION,
            bucket: process.env.AWS_BUCKET_NAME
        });
        
        // Verify purchase/access rights here
        
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'mens-7-day-mental-ebook-final3.pdf' // Updated to match the actual file name
        });

        console.log('Generated S3 command:', command);

        // Generate a pre-signed URL that expires in 1 hour
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        console.log('Generated signed URL successfully');
        
        res.json({ downloadUrl: signedUrl });
    } catch (error) {
        console.error('Error in /api/ebook/:bookId:', error);
        res.status(500).json({ 
            error: 'Failed to generate download URL',
            details: error.message 
        });
    }
});

// Proxy endpoint for PDF viewing
app.get('/api/view-pdf/:bookId', async (req, res) => {
    try {
        const { bookId } = req.params;
        console.log('Attempting to stream PDF:', bookId);
        
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'mens-7-day-mental-ebook-final3.pdf'
        });

        const response = await s3Client.send(command);
        
        // Set appropriate headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Stream the PDF directly to the response
        response.Body.pipe(res);
    } catch (error) {
        console.error('Error streaming PDF:', error);
        res.status(500).json({ 
            error: 'Failed to stream PDF',
            details: error.message 
        });
    }
});

// Health check endpoints
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/health', async (req, res) => {
    try {
        // Test S3 connection
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: 'mens-7-day-mental-ebook-final3.pdf'
        });
        await s3Client.send(command);

        res.status(200).json({
            status: 'OK',
            services: {
                s3: 'Connected',
                api: 'Running'
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'Error',
            services: {
                s3: error.message,
                api: 'Running'
            },
            timestamp: new Date().toISOString()
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
