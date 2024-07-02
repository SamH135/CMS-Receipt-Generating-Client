import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { rgcLogin } from '../redux/actions/authActions';

const RGCLogin = () => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const success = await dispatch(rgcLogin(passcode));
    if (success) {
      navigate('/user-selection');
    } else {
      setError('Login failed. Please check your passcode and try again.');
    }
  };

  return (
    <div className="container mt-5">
      <h2>RGC Login</h2>
      {error && <div className="alert alert-danger">{error}</div>}
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
    </div>
  );
};

export default RGCLogin;