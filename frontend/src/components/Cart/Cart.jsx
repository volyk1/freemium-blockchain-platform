import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.scss';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(items);
  }, []);

  const removeFromCart = (index) => {
    const newItems = cartItems.filter((_, i) => i !== index);
    setCartItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
  };

  const updateTransactionStats = (amount) => {
    const currentStats = JSON.parse(localStorage.getItem('transactionStats') || '{"totalTransactions":0,"totalAmount":0}');
    const newStats = {
      totalTransactions: currentStats.totalTransactions + 1,
      totalAmount: currentStats.totalAmount + amount
    };
    localStorage.setItem('transactionStats', JSON.stringify(newStats));
  };

  const checkout = async () => {
    try {
      setLoading(true);
      
      const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.discountedPrice), 0);
      
      // Create transaction record
      const transaction = {
        id: `TX${Date.now()}`, // Simple transaction ID generation
        timestamp: Date.now(),
        products: cartItems,
        totalAmount,
        status: 'COMPLETED'
      };

      // Save to transaction history
      const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      transactions.push(transaction);
      localStorage.setItem('transactions', JSON.stringify(transactions));

      // Update transaction statistics
      updateTransactionStats(totalAmount);

      // Clear cart
      localStorage.setItem('cart', '[]');
      setCartItems([]);

      alert('Purchase successful!');
      navigate('/purchase-history');
    } catch (error) {
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <button onClick={() => navigate('/store')}>Go to Store</button>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={index} className="cart-item">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <p>{item.version} Version</p>
                  <div className="price-info">
                    <p className="original-price">
                      Original: {item.originalPrice} ETH
                    </p>
                    <p className="discount-applied">
                      Discount: {(item.appliedDiscount * 100).toFixed(0)}%
                    </p>
                    <p className="final-price">
                      Final: {item.discountedPrice} ETH
                    </p>
                  </div>
                </div>
                <button 
                  className="remove-btn"
                  onClick={() => removeFromCart(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>
                {cartItems.reduce((sum, item) => sum + parseFloat(item.originalPrice), 0).toFixed(3)} ETH
              </span>
            </div>
            <div className="summary-row discount">
              <span>Discount:</span>
              <span>
                -{(cartItems.reduce((sum, item) => 
                  sum + (parseFloat(item.originalPrice) - parseFloat(item.discountedPrice))
                , 0)).toFixed(3)} ETH
              </span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>
                {cartItems.reduce((sum, item) => sum + parseFloat(item.discountedPrice), 0).toFixed(3)} ETH
              </span>
            </div>
            <button 
              className="checkout-btn"
              onClick={checkout}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;


