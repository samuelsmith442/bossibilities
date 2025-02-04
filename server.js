// Load environment variables based on NODE_ENV
if (process.env.NODE_ENV === 'production') {
    require('dotenv').config();
} else {
    require('dotenv').config({ path: '.env.local' });
}

const express = require('express');
const path = require('path');

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
        const baseURL = process.env.NODE_ENV === 'production' 
            ? process.env.RENDER_EXTERNAL_URL || 'https://bossibilities-1.onrender.com'
            : `${req.protocol}://${req.get('host')}`;

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
            success_url: `${baseURL}/success`,
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
    
    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(403).json({ error: 'Payment verification failed' });
    }
    
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
