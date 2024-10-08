// components/UserSelection.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setRGCUsername } from '../redux/actions/authActions';
import axiosInstance from '../axiosInstance';

const UserSelection = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
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

  const handleUserSelect = () => {
    if (selectedUser) {
      dispatch(setRGCUsername(selectedUser));
      localStorage.setItem('rgcUsername', selectedUser);
      navigate('/client-selection');
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
        fetchUsers();
        setShowAddUser(false);
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
      <h2>Who's making receipts?</h2>
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
      <button className="btn btn-primary mb-3" onClick={handleUserSelect}>Continue</button>
      <br></br>
      <br></br>
      <h4>Don't see your name? Add yourself as a new user to the system.</h4>
      <button className="btn btn-secondary mb-3" onClick={() => setShowAddUser(!showAddUser)}>
        {showAddUser ? 'Cancel' : 'Add User'}
      </button>

      {showAddUser && (
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
      )}
    </div>
  );
};

export default UserSelection;