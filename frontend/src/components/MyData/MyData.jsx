import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyData.scss';

const MyData = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    email: '',
    name: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    newEmail: '',
    newName: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/api/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data);
      setEditForm({
        newEmail: response.data.email,
        newName: response.data.name
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3001/api/user/update', {
        newEmail: editForm.newEmail,
        newName: editForm.newName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUserData({
        email: editForm.newEmail,
        name: editForm.newName
      });
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:3001/api/user/change-password',
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Update token if a new one is returned
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      setSuccess('Password updated successfully!');
      setIsChangingPassword(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Password change error:', error);
      setError(error.response?.data?.error || 'Failed to update password');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:3001/api/user/delete', {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        navigate('/login');
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to delete account');
      }
    }
  };

  return (
    <div className="my-data">
      <div className="my-data-card">
        <h2>My Profile Data</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {!isEditing && !isChangingPassword ? (
          <div className="profile-info">
            <div className="info-group">
              <label>Email:</label>
              <span>{userData.email}</span>
            </div>
            <div className="info-group">
              <label>Name:</label>
              <span>{userData.name}</span>
            </div>
            <div className="button-group">
              <button 
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
              <button 
                className="password-button"
                onClick={() => setIsChangingPassword(true)}
              >
                Change Password
              </button>
              <button 
                className="delete-button"
                onClick={handleDeleteAccount}
              >
                Delete Account
              </button>
            </div>
          </div>
        ) : isEditing ? (
          <form onSubmit={handleUpdate} className="edit-form">
            <div className="form-group">
              <label>New Email:</label>
              <input
                type="email"
                value={editForm.newEmail}
                onChange={(e) => setEditForm({...editForm, newEmail: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Name:</label>
              <input
                type="text"
                value={editForm.newName}
                onChange={(e) => setEditForm({...editForm, newName: e.target.value})}
                required
              />
            </div>
            <div className="button-group">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handlePasswordChange} className="password-form">
            <div className="form-group">
              <label>Current Password:</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password:</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password:</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                required
                minLength="6"
              />
            </div>
            <div className="button-group">
              <button type="submit" className="save-button">
                Update Password
              </button>
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => {
                  setIsChangingPassword(false);
                  setPasswordForm({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default MyData;



