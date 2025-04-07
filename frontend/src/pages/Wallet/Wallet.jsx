
import { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import './Wallet.css';

const Wallet = () => {
  const { token, url, currency } = useContext(StoreContext);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [addAmount, setAddAmount] = useState('');
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Fetch wallet details
  const fetchWalletDetails = async () => {
    try {
      const response = await axios.get(`${url}/api/wallet/details`, {
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

  // Add funds to wallet
  const addFundsToWallet = async () => {
    if (!addAmount || isNaN(addAmount) || parseFloat(addAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsAddingFunds(true);
    const amountToAdd = parseFloat(addAmount);
    try {
      const response = await axios.post(
        `${url}/api/wallet/add`,
        { amount: amountToAdd },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success('Funds added successfully');
        
        // Update balance locally
        setWalletBalance((prevBalance) => prevBalance + amountToAdd);

        // Clear input field and refetch details for updated transactions
        setAddAmount('');
        fetchWalletDetails();
      }
    } catch (error) {
      toast.error('Failed to add funds');
    } finally {
      setIsAddingFunds(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchWalletDetails();
    }
  }, [token]);

  // Render transaction type icon
  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return '➕';
      case 'debit':
        return '➖';
      case 'refund':
        return '🔙';
      default:
        return '💱';
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1>My Wallet</h1>
        <div className="wallet-balance">
          <h2>Current Balance</h2>
          <p className="balance">
            {currency}
            {walletBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="wallet-actions">
        <div className="add-funds">
          <input
            type="number"
            placeholder="Enter amount to add"
            value={addAmount}
            onChange={(e) => setAddAmount(e.target.value)}
            min="0"
            step="0.01"
          />
          <button onClick={addFundsToWallet} disabled={isAddingFunds}>
            {isAddingFunds ? 'Adding...' : 'Add Amount'}
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
                  <td>
                    {getTransactionIcon(transaction.type)}{' '}
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </td>
                  <td>{transaction.description}</td>
                  <td
                    className={transaction.type === 'credit' ? 'credit' : 'debit'}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}
                    {currency}
                    {Math.abs(transaction.amount).toFixed(2)}
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
