// src/components/ReceiptCreation.jsx

import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import ReceiptTable from './ReceiptTable';
import axiosInstance from '../axiosInstance';
import { setSelectedClient } from '../redux/actions/authActions';

const ReceiptCreation = () => {
  const selectedClient = useSelector((state) => state.auth.selectedClient);
  const createdBy = useSelector((state) => state.auth.rgcUsername);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const receiptTableRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [checkNumber, setCheckNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showCheckPrompt, setShowCheckPrompt] = useState(false);

  useEffect(() => {
    if (!selectedClient) {
      const storedClient = JSON.parse(localStorage.getItem('selectedClient'));
      if (storedClient) {
        dispatch(setSelectedClient(storedClient));
      } else {
        navigate('/client-selection');
      }
    }
  }, [selectedClient, navigate, dispatch]);

  useEffect(() => {
    if (selectedClient) {
      setPaymentMethod(selectedClient.paymentmethod);
    }
  }, [selectedClient]);

  const handleSubmit = () => {
    if (!selectedClient || !receiptTableRef.current) {
      console.error('Missing client or receipt table data');
      return;
    }
    if (paymentMethod === 'Check' && !checkNumber.trim()) {
      setShowCheckPrompt(true);
    } else {
      setShowModal(true);
    }
  };

  const handleCheckPromptResponse = (includeCheckNumber) => {
    setShowCheckPrompt(false);
    if (includeCheckNumber) {
      // User wants to include a check number, focus on the input
      document.getElementById('checkNumber').focus();
    } else {
      // User opts out, set default check number and proceed
      setCheckNumber('0000');
      setShowModal(true);
    }
  };

  const confirmSubmit = async (isCorporate) => {
    setShowModal(false);
    
    try {
      const receiptData = {
        clientID: selectedClient.clientid,
        clientName: selectedClient.clientname,
        clientType: selectedClient.clienttype,
        createdBy,
        isCorporate,
        checkNumber: checkNumber.trim() || null,
        ...receiptTableRef.current.getReceiptData(),
      };
  
      const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/rgc/receipts`, receiptData);
      // Clear all related localStorage items
      localStorage.removeItem(`receiptTableData_${selectedClient.clientid}`);
      localStorage.removeItem(`receiptData_${selectedClient.clientid}`);
      localStorage.removeItem('selectedClient');
      // Clear the data in ReceiptTable component
      if (receiptTableRef.current && receiptTableRef.current.clearLocalStorage) {
        receiptTableRef.current.clearLocalStorage();
      }
      navigate('/print-preview', { state: { receiptData: { ...receiptData, ...response.data } } });
    } catch (error) {
      if (error.message === "You must name the custom metal or delete it from the receipt") {
        alert(error.message);
      } else {
        console.error('Error submitting receipt:', error);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2>Create Receipt for {selectedClient?.clientname}</h2>

      <ReceiptTable 
        ref={receiptTableRef}
        clientType={selectedClient?.clienttype} 
        clientID={selectedClient?.clientid}
      />

      <div className="mb-3">
        <label htmlFor="checkNumber" className="form-label">
          Check Number {paymentMethod === 'Check' ? '(Requested)' : '(Optional)'}:
        </label>
        <input
          type="text"
          className="form-control"
          id="checkNumber"
          value={checkNumber}
          onChange={(e) => setCheckNumber(e.target.value)}
        />
      </div>
      <button 
        className="btn btn-primary mt-3" 
        onClick={handleSubmit}
      >
        Create Receipt
      </button>

      {showCheckPrompt && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Check Number</h2>
            <p>Do you want to include a check number now?</p>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => handleCheckPromptResponse(true)}>
                Yes, I'll enter it now
              </button>
              <button className="btn btn-primary" onClick={() => handleCheckPromptResponse(false)}>
                No, I'll fill it in later
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Corporate Client Confirmation</h2>
            <p>Is this a corporate client that requires price information to be excluded from the customer copy?</p>
            <div className="modal-buttons">
              <button className="btn btn-secondary" onClick={() => confirmSubmit(true)}>
                Yes, Corporate Client
              </button>
              <button className="btn btn-primary" onClick={() => confirmSubmit(false)}>
                No, Regular Client
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptCreation;