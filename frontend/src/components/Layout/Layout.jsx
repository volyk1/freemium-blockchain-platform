import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import './Layout.scss';

const Layout = () => {
  const location = useLocation();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="layout">
      <nav className="main-nav">
        <div className="logo">Blockchain Platform</div>
        <div className="nav-links">
          <Link 
            to="/dashboard" 
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </Link>
          <Link 
            to="/store" 
            className={`nav-link ${location.pathname === '/store' ? 'active' : ''}`}
          >
            Store
          </Link>
          <Link 
            to="/cart" 
            className={`nav-link ${location.pathname === '/cart' ? 'active' : ''}`}
          >
            Cart
          </Link>
          <Link 
            to="/purchase-history" 
            className={`nav-link ${location.pathname === '/purchase-history' ? 'active' : ''}`}
          >
            Purchase History
          </Link>
          <Link 
            to="/my-data" 
            className={`nav-link ${location.pathname === '/my-data' ? 'active' : ''}`}
          >
            My Data
          </Link>
        </div>
        <div className="user-info">
          <span>Welcome, Dmytro Volyk</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;



