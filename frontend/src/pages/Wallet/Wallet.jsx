import { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../Context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Wallet.css';

const Wallet = () => {
  const { token, url, currency } = useContext(StoreContext);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [addAmount, setAddAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Fetch wallet details
  const fetchWalletDetails = async () => {
    try {
      const response = await axios.get(`${url}/api/wallet/details?userId=${token}`, {
        headers: { token },
      });

      if (response.data.success) {
        setWalletBalance(response.data.balance);
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      toast.error('Failed to fetch wallet details');
    }
  };

  // Add funds using Razorpay
  const addFundsToWallet = async () => {
    if (!addAmount || isNaN(addAmount) || parseFloat(addAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amountToAdd = parseFloat(addAmount);
    try {
      const response = await axios.post(
        `${url}/api/wallet/create-order`,
        { amount: amountToAdd, userId: token },
        { headers: { token } }
      );

      if (!response.data.success) {
        toast.error("Failed to create order");
        return;
      }

      const options = {
        key: "rzp_test_eRSHa1kaUjMssI",
        amount: response.data.order.amount,
        currency: response.data.order.currency,
        name: "NoVeg Pvt. Ltd.",
        description: "Wallet Top-Up",
        image: "/logo.png",
        order_id: response.data.order.id,
        handler: async function (response) {
          const verifyResponse = await axios.post(
            `${url}/api/wallet/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              userId: token,
              amount: amountToAdd,
            },
            { headers: { token } }
          );

          if (verifyResponse.data.success) {
            toast.success("Wallet recharged successfully!");
            setWalletBalance(prevBalance => prevBalance + amountToAdd);
            setAddAmount("");
            fetchWalletDetails();
          } else {
            toast.error("Payment verification failed");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
          contact: "9876543210",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const loadScript = await loadRazorpayScript();
      if (!loadScript) {
        toast.error("Failed to load Razorpay");
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error("Failed to process payment");
    }
  };

  useEffect(() => {
    if (token) {
      fetchWalletDetails();
    }
  }, [token]);

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1>My Wallet</h1>
        <div className="wallet-balance">
          <h2>Current Balance</h2>
          <p className="balance">
            {currency}{walletBalance.toFixed(2)}
          </p>
        </div>
      </div>

  <div className="wallet-actions">
    <div className="add-funds">
    <input
      type="number"
      value={addAmount}
      onChange={(e) => setAddAmount(e.target.value)}
      placeholder="Enter amount"
    />
    <button onClick={addFundsToWallet} disabled={isAddingFunds}>
      {isAddingFunds ? "Processing..." : "Add Amount"}
    </button>
    </div>
  </div>

      <div className="transactions-section">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="no-transactions">No transactions yet</p>
        ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => (
                <tr key={index}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                  <td>{transaction.description}</td>
                  <td className={transaction.type === 'credit' ? 'credit' : 'debit'}>
                    {transaction.type === 'credit' ? '+' : '-'}
                    {currency}{Math.abs(transaction.amount).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Wallet;
