import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RFMDAnalysis } from '../../services/RFMDanalysis';
import './Dashboard.scss';

const Dashboard = () => {
  const [statistics, setStatistics] = useState({
    totalTransactions: 0,
    totalAmount: 0
  });
  const [rfmdMetrics, setRfmdMetrics] = useState(null);
  const [totalValue, setTotalValue] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load transaction statistics
    const stats = JSON.parse(localStorage.getItem('transactionStats') || '{"totalTransactions":0,"totalAmount":0}');
    setStatistics(stats);

    // Load transactions and calculate RFMD metrics
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const rfmdAnalysis = new RFMDAnalysis(transactions);
    const metrics = rfmdAnalysis.calculateMetrics();
    const cohort = rfmdAnalysis.calculateCohort();
    const discount = rfmdAnalysis.calculateDiscount();

    // Calculate total value with personalized discount
    const discountedTotal = stats.totalAmount * (1 - discount);
    const savings = stats.totalAmount - discountedTotal;

    setTotalValue({
      original: stats.totalAmount,
      discounted: discountedTotal.toFixed(3),
      savings: savings.toFixed(3),
      discountPercentage: (discount * 100).toFixed(0)
    });

    setRfmdMetrics({
      ...metrics,
      cohort,
      discount
    });

    // Store RFMD metrics in localStorage for use in Store
    localStorage.setItem('rfmdMetrics', JSON.stringify({
      ...metrics,
      cohort,
      discount
    }));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Create Transaction</h2>
          <p>Go to the Store page to create a new transaction</p>
          <button 
            className="store-button"
            onClick={() => navigate('/store')}
          >
            Go to Store
          </button>
        </div>

        <div className="dashboard-card statistics">
          <h2>Transaction Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Total Transactions</h3>
              <p className="stat-value">{statistics.totalTransactions}</p>
            </div>
            <div className="stat-item">
              <h3>Total Amount</h3>
              <p className="stat-value">{statistics.totalAmount.toFixed(3)} ETH</p>
            </div>
          </div>
        </div>

        {rfmdMetrics && (
          <div className="dashboard-card rfmd">
            <h2>Your Customer Profile</h2>
            <div className="rfmd-grid">
              <div className="rfmd-item">
                <h3>Customer Cohort</h3>
                <p className={`cohort-badge ${rfmdMetrics.cohort.toLowerCase()}`}>
                  {rfmdMetrics.cohort}
                </p>
              </div>
              {totalValue && (
                <div className="rfmd-item">
                  <h3>Your Personalized Discount</h3>
                  <p className="discount-value">
                    {totalValue.discountPercentage}%
                  </p>
                </div>
              )}
              <div className="rfmd-metrics">
                <div className="metric">
                  <span>Recency</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ width: `${rfmdMetrics.recency * 100}%` }}
                    />
                  </div>
                </div>
                <div className="metric">
                  <span>Frequency</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ width: `${rfmdMetrics.frequency * 100}%` }}
                    />
                  </div>
                </div>
                <div className="metric">
                  <span>Monetary</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ width: `${rfmdMetrics.monetary * 100}%` }}
                    />
                  </div>
                </div>
                <div className="metric">
                  <span>Diversity</span>
                  <div className="metric-bar">
                    <div 
                      className="metric-fill"
                      style={{ width: `${rfmdMetrics.diversity * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              {totalValue && (
                <div className="total-value-summary">
                  <h3>Your Personalized Price</h3>
                  <div className="value-details">
                    <div className="value-item highlight">
                      <span className="amount">{totalValue.discounted} ETH</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;




