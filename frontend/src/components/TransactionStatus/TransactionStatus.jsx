import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TransactionStatus.scss';

const TransactionStatus = () => {
  const { transactionId } = useParams();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost:3001/api/transactions/${transactionId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setStatus(response.data);
        
        // Continue polling if transaction is pending
        if (response.data.status === 'pending') {
          setTimeout(checkStatus, 5000);
        }
      } catch (err) {
        setError('Failed to fetch transaction status');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [transactionId]);

  if (loading) return <div className="loading">Loading transaction status...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="transaction-status">
      <h2>Transaction Status</h2>
      <div className="status-card">
        <div className={`status ${status.status}`}>
          {status.status.toUpperCase()}
        </div>
        <div className="details">
          <p><strong>Transaction ID:</strong> {status.id}</p>
          <p><strong>Amount:</strong> {status.amount} ETH</p>
          <p><strong>Date:</strong> {new Date(status.date).toLocaleString()}</p>
          {status.hash && (
            <p>
              <strong>Transaction Hash:</strong>
              <a 
                href={`https://etherscan.io/tx/${status.hash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {status.hash}
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;


