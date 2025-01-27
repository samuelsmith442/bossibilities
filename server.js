const express = require('express');
const path = require('path');
const cors = require('cors');
const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client = require('./config/s3');

const app = express();
require('dotenv').config();

// Middleware
app.use(cors());
app.use(express.static(path.join(__dirname)));
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
