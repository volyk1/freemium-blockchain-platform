import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Store.scss';

const IT_PRODUCTS = [
  {
    id: 1,
    name: 'Development License',
    type: 'Software',
    basePrice: '0.1',
    premiumPrice: '0.2',
    description: 'Annual software development license',
    features: {
      base: ['Basic IDE support', 'Standard libraries', 'Community support'],
      premium: ['Advanced IDE features', 'Premium libraries', '24/7 Support', 'Priority updates']
    },
    image: '/images/software-license.png'
  },
  {
    id: 2,
    name: 'Cloud Storage Pro',
    type: 'Service',
    basePrice: '0.05',
    premiumPrice: '0.1',
    description: 'Secure cloud storage solution',
    features: {
      base: ['100GB Storage', 'Basic encryption', 'Web access'],
      premium: ['500GB Storage', 'Advanced encryption', 'Mobile access', 'Auto-sync']
    },
    image: '/images/cloud-storage.png'
  },
  {
    id: 3,
    name: 'Security Suite',
    type: 'Software',
    basePrice: '0.15',
    premiumPrice: '0.25',
    description: 'Enterprise security solution',
    features: {
      base: ['Basic antivirus', 'Firewall protection', 'Malware detection'],
      premium: ['Advanced threat detection', 'AI-based security analysis', '24/7 security monitoring']
    },
    image: '/images/security.png'
  },
  {
    id: 4,
    name: 'API Access',
    type: 'Service',
    basePrice: '0.08',
    premiumPrice: '0.15',
    description: '10,000 API calls package',
    features: {
      base: ['10,000 API calls', 'Basic rate limits', 'Public endpoints'],
      premium: ['50,000 API calls', 'Priority rate limits', 'Private endpoints', 'Enhanced security']
    },
    image: '/images/api.png'
  },
  {
    id: 5,
    name: 'Database License',
    type: 'Software',
    basePrice: '0.12',
    premiumPrice: '0.22',
    description: 'Enterprise database solution',
    features: {
      base: ['SQL support', 'Basic analytics', 'Standard performance'],
      premium: ['NoSQL + SQL support', 'Advanced analytics', 'High-performance scaling', 'Automated backups']
    },
    image: '/images/database.png'
  },
  {
    id: 6,
    name: 'Tech Support',
    type: 'Service',
    basePrice: '0.07',
    premiumPrice: '0.12',
    description: '24/7 technical support package',
    features: {
      base: ['Email support', 'Response time: 24h', 'Basic troubleshooting'],
      premium: ['Phone + email support', 'Response time: 1h', 'Dedicated support manager', 'Proactive system monitoring']
    },
    image: '/images/support.png'
  }
];

const Store = () => {
  const [userCohort, setUserCohort] = useState(null);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [personalizedPrice, setPersonalizedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userDiscount, setUserDiscount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserMetrics();
    // Get RFM-D metrics from localStorage
    const rfmdMetrics = JSON.parse(localStorage.getItem('rfmdMetrics') || '{}');
    setUserDiscount(rfmdMetrics.discount || 0);
  }, []);

  const fetchUserMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/user/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCohort(response.data);
    } catch (err) {
      console.error('Error fetching user metrics:', err);
    }
  };

  const calculatePersonalizedPrice = async (product, isPremium) => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/pricing/calculate',
        {
          productId: product.id,
          isPremium,
          basePrice: isPremium ? product.premiumPrice : product.basePrice,
          userCohort
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSelectedProduct({ ...product, isPremium });
      setPersonalizedPrice(response.data.personalizedPrice);
    } catch (err) {
      setError('Failed to calculate personalized price');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (originalPrice) => {
    const discountMultiplier = 1 - userDiscount;
    return (originalPrice * discountMultiplier).toFixed(3);
  };

  const addToCart = (product, version) => {
    const originalPrice = version === 'premium' ? product.premiumPrice : product.basePrice;
    const discountedPrice = calculateDiscountedPrice(parseFloat(originalPrice));

    const cartItem = {
      ...product,
      version,
      originalPrice,
      discountedPrice,
      appliedDiscount: userDiscount
    };

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart');
  };

  const removeFromCart = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const processTransaction = async () => {
    try {
      setLoading(true);
      setError('');

      if (!window.ethereum) {
        throw new Error('Please install MetaMask');
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const userAddress = accounts[0];

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3001/api/transactions/create',
        {
          items: cart,
          walletAddress: userAddress,
          userCohort
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      navigate(`/transaction/${response.data.transactionId}`);
    } catch (err) {
      setError(err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    storeContainer: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
    },
    productsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '2rem',
    },
    productCard: {
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
    },
    productImage: {
      width: '100%',
      height: '300px',
      background: '#f8f9fa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    },
    image: {
      width: '250px',
      height: '250px',
      objectFit: 'contain',
    },
    productInfo: {
      padding: '1.5rem',
    },
    title: {
      margin: '0 0 0.5rem',
      fontSize: '1.25rem',
      color: '#2d3748',
    },
    description: {
      color: '#4a5568',
      marginBottom: '1rem',
    },
    versionSection: {
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem',
    },
    price: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#3b82f6',
    },
    featuresList: {
      listStyle: 'none',
      padding: 0,
      margin: '1rem 0',
    },
    button: {
      width: '100%',
      padding: '0.75rem',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: '#3b82f6',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.storeContainer}>
      {error && <div className="error-message">{error}</div>}
      
      {userCohort && (
        <div className="user-cohort">
          <h3>Your Customer Profile</h3>
          <p>Cohort: {userCohort.name}</p>
          <p>Potential Discount: Up to {userCohort.maxDiscount}%</p>
        </div>
      )}

      {userDiscount > 0 && (
        <div className="discount-banner">
          Your personalized discount: {(userDiscount * 100).toFixed(0)}%
        </div>
      )}

      <div style={styles.productsGrid}>
        {IT_PRODUCTS.map(product => (
          <div key={product.id} style={styles.productCard}>
            <div style={styles.productImage}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={styles.image}
              />
            </div>
            <div style={styles.productInfo}>
              <h3 style={styles.title}>{product.name}</h3>
              <p style={styles.description}>{product.description}</p>
              
              <div style={styles.versionSection}>
                <h4>Base Version</h4>
                <div className="price-container">
                  <p className="original-price">{product.basePrice} ETH</p>
                  {userDiscount > 0 && (
                    <p className="discounted-price">
                      {calculateDiscountedPrice(product.basePrice)} ETH
                    </p>
                  )}
                </div>
                <ul style={styles.featuresList}>
                  {product.features.base.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <button 
                  style={styles.button}
                  onClick={() => addToCart(product, 'base')}
                >
                  Add to Cart
                </button>
              </div>

              <div style={{...styles.versionSection, backgroundColor: '#f0f7ff'}}>
                <h4>Premium Version</h4>
                <div className="price-container">
                  <p className="original-price">{product.premiumPrice} ETH</p>
                  {userDiscount > 0 && (
                    <p className="discounted-price">
                      {calculateDiscountedPrice(product.premiumPrice)} ETH
                    </p>
                  )}
                </div>
                <ul style={styles.featuresList}>
                  {product.features.premium.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
                <button 
                  style={{...styles.button, backgroundColor: '#4f46e5'}}
                  onClick={() => addToCart(product, 'premium')}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="shopping-cart">
          <h3>Shopping Cart</h3>
          {cart.map((item, index) => (
            <div key={index} className="cart-item">
              <div className="item-details">
                <h4>{item.name}</h4>
                <p>{item.version} Version</p>
              </div>
              <div className="item-price">
                {item.discountedPrice} ETH
              </div>
              <button onClick={() => removeFromCart(index)}>Remove</button>
            </div>
          ))}
          <div className="cart-total">
            <span>Total:</span>
            <span>
              {cart.reduce((sum, item) => sum + parseFloat(item.discountedPrice), 0).toFixed(3)} ETH
            </span>
          </div>
          <button 
            className="checkout-button"
            onClick={processTransaction}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Store;

