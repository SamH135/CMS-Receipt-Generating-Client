// components/UserSelection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axiosInstance from '../axiosInstance';

const UserSelection = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newUser, setNewUser] = useState({
    userID: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/api/rgc/userList');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users. Please try again.');
    }
  };

  const handleUserSelect = async () => {
    if (selectedUser) {
      try {
        const response = await axiosInstance.post('/api/rgc/setUsername', { username: selectedUser });
        dispatch({ type: 'SET_USERNAME', payload: response.data.username });
        navigate('/client-selection');
      } catch (error) {
        console.error('Error setting username:', error);
        setError('Failed to set username. Please try again.');
      }
    }
  };

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newUser.password !== newUser.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await axiosInstance.post('/api/rgc/createUser', newUser);
      if (response.data.success) {
        setUsers([...users, response.data.username]);
        setNewUser({ userID: '', username: '', password: '', confirmPassword: '' });
        setSuccessMessage(response.data.message);
        fetchUsers(); // Refresh the user list
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setError(error.response?.data?.message || 'Failed to add new user. Please try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Select User</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <select
        className="form-control mb-3"
        value={selectedUser}
        onChange={(e) => setSelectedUser(e.target.value)}
      >
        <option value="">Select a user</option>
        {users.map((username) => (
          <option key={username} value={username}>{username}</option>
        ))}
      </select>
      <button className="btn btn-primary" onClick={handleUserSelect}>Continue</button>

      <h3 className="mt-5">Add New User</h3>
      <form onSubmit={handleAddUser}>
        <div className="form-group">
          <label htmlFor="userID">User ID:</label>
          <input
            type="text"
            className="form-control"
            id="userID"
            name="userID"
            value={newUser.userID}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={newUser.username}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={newUser.password}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            className="form-control"
            id="confirmPassword"
            name="confirmPassword"
            value={newUser.confirmPassword}
            onChange={handleInputChange}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary mt-3">Add User</button>
      </form>
    </div>
  );
};

export default UserSelection;