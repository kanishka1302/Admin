import { useState } from 'react';

const RazorpayPayment = () => {
  const [amount, setAmount] = useState('');

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async (amount) => {
    try {
      const response = await fetch('https://admin-92vt.onrender.com/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: parseFloat(amount) })
      });

      if (!response.ok) {
        throw new Error('Order creation failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      const response = await fetch('https://admin-92vt.onrender.com/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          userId: 'userId_here', // Make sure to pass the userId here
          amount: amount, // Pass the amount if needed for verification
        })
      });
  
      return await response.json();
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  };
  
  const handlePayment = async () => {
    try {
      // Ensure Razorpay script is loaded
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load');
        return;
      }

      // Create order on backend
      const data = await createOrder(amount);

      // Razorpay options
      const options = {
        key: "rzp_test_eRSHa1kaUjMssI",
        amount: data.amount,
        currency: data.currency,
        name: 'Your Company Name',
        description: 'Test Transaction',
        order_id: data.id,
        handler: async (response) => {
          try {
            // Verify payment on backend
            const verifyResponse = await verifyPayment(response);

            if (verifyResponse.success) {
              alert('Payment Successful!');
              // Handle successful payment (e.g., update UI, save to database)
            } else {
              alert('Payment Verification Failed');
            }
          } catch (error) {
            console.error('Verification error:', error);
            alert('Payment Verification Failed');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
          contact: '9999999999'
        },
        notes: {
          address: 'Test Address'
        },
        theme: {
          color: '#3399cc'
        }
      };

      // Open Razorpay checkout
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Could not initiate payment');
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl mb-4">Razorpay Payment Gateway</h2>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount"
        className="w-full p-2 border rounded mb-4"
      />
      <button
        onClick={handlePayment}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
      >
        Pay Now
      </button>
    </div>
  );
};

export default RazorpayPayment;

