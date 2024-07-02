// RGCApp.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { loginSuccess, setRGCUsername } from './redux/actions/authActions';
import RGCLogin from './components/RGCLogin';
import UserSelection from './components/UserSelection';
import ClientSelection from './components/ClientSelection';
import ReceiptCreation from './components/ReceiptCreation';
import PrintPreview from './components/PrintPreview';

function App() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    const token = localStorage.getItem('rgcToken');
    const username = localStorage.getItem('rgcUsername');
    if (token) {
      dispatch(loginSuccess(token));
    }
    if (username) {
      dispatch(setRGCUsername(username));
    }
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<RGCLogin />} />
        <Route
          path="/user-selection"
          element={isAuthenticated ? <UserSelection /> : <Navigate to="/login" />}
        />
        <Route
          path="/client-selection"
          element={isAuthenticated ? <ClientSelection /> : <Navigate to="/login" />}
        />
        <Route
          path="/receipt-creation"
          element={isAuthenticated ? <ReceiptCreation /> : <Navigate to="/login" />}
        />
        <Route
          path="/print-preview"
          element={isAuthenticated ? <PrintPreview /> : <Navigate to="/login" />}
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;