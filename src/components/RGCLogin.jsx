// src/components/RGCLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { rgcLogin } from '../redux/actions/authActions';
import axiosInstance from '../axiosInstance';

const RGCLogin = () => {
  const [passcode, setPasscode] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const error = useSelector(state => state.auth.error);

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Login button pressed');
    console.log('Passcode:', passcode);
    
    try {
      console.log('Sending login request');
      const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/rgc/login`, { passcode }, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        console.log('Token received, storing in localStorage');
        localStorage.setItem('token', response.data.token);
        dispatch(rgcLogin(response.data.token));
        navigate('/user-selection');
      }
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      dispatch({ type: 'LOGIN_FAILURE', payload: error.response?.data?.message || 'Login failed' });
    }
  };

  return (
    <div className="container mt-5">
      <h2>RGC Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="password"
            className="form-control"
            placeholder="Enter 4-digit passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            maxLength="4"
          />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
      </form>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
};

export default RGCLogin;