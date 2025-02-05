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

// Serve static files from the root directory
app.use(express.static(__dirname));

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

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
        // Get the domain based on environment
        let domain;
        if (process.env.NODE_ENV === 'production') {
            domain = 'https://bossibilities-1.onrender.com';
        } else {
            domain = process.env.DOMAIN || 'http://localhost:3000';
        }

        console.log('Environment:', process.env.NODE_ENV);
        console.log('Domain for checkout:', domain);

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
            success_url: `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${domain}/ebook.html`,
        });

        res.json({ sessionId: session.id });
    } catch (err) {
        console.error('Stripe Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Verify payment and return download URL
app.get('/api/verify-payment/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        console.log('Verifying payment for session:', sessionId);

        // Verify the session exists and was paid
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        console.log('Session status:', session.payment_status);

        if (session.payment_status !== 'paid') {
            console.log('Payment not completed for session:', sessionId);
            return res.status(400).json({ error: 'Payment required' });
        }

        // Generate download URL
        const downloadUrl = `/public/mens-7-day-mental-ebook-final3.pdf`;
        res.json({ downloadUrl });
    } catch (err) {
        console.error('Verification Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('*', (req, res, next) => {
    if (req.path.endsWith('.html') || req.path === '/') {
        next();
    } else {
        res.sendFile(path.join(__dirname, req.path));
    }
});

// Handle 404
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
