require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProduct() {
  try {
    // Create a product
    const product = await stripe.products.create({
      name: "7-Day Mental E-Book",
      description: "Men's 7-Day Mental E-Book",
      type: 'good',
    });

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 499, // $4.99
      currency: 'usd',
    });

    console.log('Product created successfully!');
    console.log('Product ID:', product.id);
    console.log('Price ID:', price.id);
    console.log('\nAdd this to your .env.local file:');
    console.log(`STRIPE_PRICE_ID=${price.id}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

createProduct();
