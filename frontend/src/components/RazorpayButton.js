import React, { useEffect, useState } from 'react';

const RazorpayButton = ({ amount, onPaymentSuccess, orderId, addToast }) => {
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        setRazorpayLoaded(true);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay SDK');
        addToast('Failed to load payment gateway. Please try again.', 'error');
      };
      document.body.appendChild(script);
    };

    if (!window.Razorpay) {
      loadRazorpayScript();
    } else {
      setRazorpayLoaded(true);
    }
  }, []);

  const displayRazorpay = async () => {
    if (!razorpayLoaded) {
      addToast('Payment gateway not loaded yet. Please wait or refresh.', 'warning');
      return;
    }

    if (!orderId) {
      addToast('Payment order not created. Please try again.', 'error');
      return;
    }

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Use environment variable for key_id
      amount: amount,
      currency: 'INR',
      name: 'E-commerce App',
      description: 'Product Purchase',
      order_id: orderId,
      handler: function (response) {
        // Handle payment success
        onPaymentSuccess(response);
      },
      prefill: {
        name: 'Guest User', // You can prefill user details here
        email: 'guest@example.com',
        contact: '9999999999',
      },
      notes: {
        address: 'Razorpay Corporate Office',
      },
      theme: {
        color: '#3399cc',
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  return (
    <button className="razorpay-button" onClick={displayRazorpay} disabled={!razorpayLoaded}>
      Pay with Razorpay
    </button>
  );
};

export default RazorpayButton;
