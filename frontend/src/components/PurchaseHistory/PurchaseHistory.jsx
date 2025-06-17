import React, { useState, useEffect } from 'react';
import './PurchaseHistory.scss';

const PurchaseHistory = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(storedTransactions.reverse()); // Show newest first
  }, []);

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="purchase-history-container">
      <h2>Purchase History</h2>
      
      {transactions.length === 0 ? (
        <div className="no-transactions">
          <p>No purchases yet</p>
        </div>
      ) : (
        <div className="transactions-list">
          {transactions.map((transaction, index) => (
            <div key={index} className="transaction-card">
              <div className="transaction-header">
                <span className="transaction-date">
                  {formatDate(transaction.timestamp)}
                </span>
                <span className="transaction-total">
                  {transaction.totalAmount} ETH
                </span>
              </div>
              
              <div className="products-list">
                {transaction.products && transaction.products.map((product, prodIndex) => (
                  <div key={prodIndex} className="product-item">
                    <div className="product-info">
                      <h3>{product.name || 'Product'}</h3>
                      {product.version && (
                        <p className="version">{product.version} Version</p>
                      )}
                      {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                        <ul className="features">
                          {product.features.map((feature, featIndex) => (
                            <li key={featIndex}>{feature}</li>
                          ))}
                        </ul>
                      )}
                      {product.type && (
                        <p className="type">{product.type}</p>
                      )}
                    </div>
                    <div className="product-price">
                      {product.price || product.amount || 0} ETH
                    </div>
                  </div>
                ))}
              </div>

              <div className="transaction-footer">
                {transaction.id && (
                  <span className="transaction-id">
                    Transaction ID: {transaction.id}
                  </span>
                )}
                {transaction.status && (
                  <span className={`transaction-status ${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PurchaseHistory;


