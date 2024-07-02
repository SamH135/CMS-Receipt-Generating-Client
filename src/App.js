// RGCApp.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import RGCLogin from './components/RGCLogin';
import UserSelection from './components/UserSelection';
import ClientSelection from './components/ClientSelection';
import ReceiptCreation from './components/ReceiptCreation';
import PrintPreview from './components/PrintPreview';

function RGCApp() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

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

export default RGCApp;