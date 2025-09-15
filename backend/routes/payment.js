const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto'); // Import crypto module
const router = express.Router();

// Initialize Razorpay (replace with your actual keys from environment variables)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Route to create a Razorpay order
router.post('/orders', async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // amount in paisa
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1, // auto-capture
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).send('Server Error');
  }
});

// Route to verify Razorpay payment
router.post('/verify', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                  .update(body.toString())
                                  .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Payment is successful, update your database here
    console.log('Payment successful and signature verified!');
    res.json({ success: true, message: 'Payment verified successfully' });
  } else {
    console.log('Payment verification failed: Invalid signature');
    res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature' });
  }
});

module.exports = router;
