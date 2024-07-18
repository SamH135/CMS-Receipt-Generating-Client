import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ReceiptTable from './ReceiptTable';
import axiosInstance from '../axiosInstance';

const ReceiptCreation = () => {
  const selectedClient = useSelector((state) => state.auth.selectedClient);
  const createdBy = useSelector((state) => state.auth.rgcUsername);
  const navigate = useNavigate();
  const receiptTableRef = useRef();

  useEffect(() => {
    if (!selectedClient) {
      navigate('/client-selection');
    }
  }, [selectedClient, navigate]);

  const handleSubmit = async () => {
    if (!selectedClient || !receiptTableRef.current) {
      console.error('Missing client or receipt table data');
      return;
    }

    const receiptData = {
      clientID: selectedClient.clientid,
      createdBy,
      ...receiptTableRef.current.getReceiptData(),
    };

    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/rgc/receipts`, receiptData);
      navigate('/print-preview', { state: { receiptData: response.data } });
    } catch (error) {
      console.error('Error submitting receipt:', error);
    }
  };

  if (!selectedClient) {
    return null;
  }

  return (
    <div className="container mt-5">
      <h2>Create Receipt for {selectedClient.clientname}</h2>
      <ReceiptTable 
        ref={receiptTableRef}
        clientType={selectedClient.clienttype} 
        clientID={selectedClient.clientid} 
      />
      <button className="btn btn-primary mt-3" onClick={handleSubmit}>Create Receipt</button>
    </div>
  );
};

export default ReceiptCreation;