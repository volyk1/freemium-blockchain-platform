import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import Store from './components/Store/Store';
import MyData from './components/MyData/MyData';
import Layout from './components/Layout/Layout';
import Cart from './components/Cart/Cart';
import PurchaseHistory from './components/PurchaseHistory/PurchaseHistory';
import './styles/main.scss';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="store" element={<Store />} />
          <Route path="my-data" element={<MyData />} />
          <Route path="cart" element={<Cart />} />
          <Route path="purchase-history" element={<PurchaseHistory />} />
          <Route index element={<Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

