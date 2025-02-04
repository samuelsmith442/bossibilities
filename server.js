// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
    require('dotenv').config();
} else {
    require('dotenv').config({ path: '.env.local' });
}

const express = require('express');
const path = require('path');
const fs = require('fs'); // Add fs module

// Log the environment (remove in production)
console.log('Environment:', process.env.NODE_ENV);

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Handle HTML routes
app.get(['/', '/index.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get(['/success', '/success.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'success.html'));
});

// Handle other HTML files
app.get('*.html', (req, res) => {
    const filePath = path.join(__dirname, req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.status(404).send('Not found');
        }
    });
});

// Stripe webhook handling
app.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    console.log('Payment successful for session:', session.id);
  }

  res.json({received: true});
});

// Create Stripe checkout session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        // Get the base URL from environment variable or request
        const baseURL = process.env.NODE_ENV === 'production' 
            ? 'https://bossibilities-1.onrender.com'
            : `${req.protocol}://${req.get('host')}`;

        console.log('Creating checkout session with baseURL:', baseURL); // Add logging

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: "7-Day Mental E-Book",
                        description: "Men's 7-Day Mental E-Book"
                    },
                    unit_amount: 5999,
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${baseURL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseURL}/ebook.html`,
        });

        res.json({ sessionId: session.id });
    } catch (err) {
        console.error('Stripe Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Verify payment and serve protected file
app.get('/api/verify-payment', async (req, res) => {
  const { sessionId } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      // Send success response with download URL
      res.json({ 
        success: true,
        downloadUrl: `/api/ebook/${sessionId}`
      });
    } else {
      res.status(400).json({ success: false, message: 'Payment not completed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Protected ebook download route
app.get('/api/ebook/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('Received download request for session:', sessionId); // Add logging

        // Verify the session exists and was paid
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log('Session status:', session.payment_status); // Add logging

        if (session.payment_status !== 'paid') {
            console.log('Payment not completed for session:', sessionId);
            return res.status(400).send('Payment required');
        }

        // Path to your PDF file
        const filePath = path.join(__dirname, 'ebooks', '7-Day-Mental-Ebook.pdf');
        console.log('Attempting to send file:', filePath); // Add logging

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error('File not found:', filePath);
            return res.status(404).send('Ebook file not found');
        }

        // Set headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=7-Day-Mental-Ebook.pdf');

        // Stream the file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (err) {
        console.error('Download Error:', err);
        res.status(500).send('Error processing download');
    }
});

app.get('*', (req, res, next) => {
    if (req.path.endsWith('.html')) {
        res.sendFile(path.join(__dirname, req.path));
    } else {
        next();
    }
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
