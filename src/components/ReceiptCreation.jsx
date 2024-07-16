// components/ReceiptCreation.jsx
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
    console.log("ReceiptCreation - selectedClient:", selectedClient);
    console.log("ReceiptCreation - createdBy:", createdBy);
    if (!selectedClient) {
      console.log("ReceiptCreation - No client selected, redirecting to client selection");
      navigate('/client-selection');
    }
  }, [selectedClient, createdBy, navigate]);

  const handleSubmit = async () => {
    console.log("ReceiptCreation - Submit button clicked");
    if (!selectedClient) {
      console.error('No client selected');
      return;
    }

    if (!receiptTableRef.current) {
      console.error('Receipt table not found');
      return;
    }

    const receiptData = {
      clientID: selectedClient.clientid,
      createdBy,
      totalPayout: receiptTableRef.current.calculateTotalPayout(),
      totalVolume: receiptTableRef.current.calculateTotalVolume(),
      metals: receiptTableRef.current.getMetals(),
      userDefinedMetals: receiptTableRef.current.getUserDefinedMetals(),
      catalyticConverters: receiptTableRef.current.getCatalyticConverters(),
    };

    try {
      const response = await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/rgc/receipts`, receiptData);
      navigate('/print-preview', { state: { receiptData: response.data } });
    } catch (error) {
      console.error('Error submitting receipt:', error);
    }
  };

  if (!selectedClient) {
    console.log("ReceiptCreation - Rendering null due to no selected client");
    return null;
  }

  console.log("ReceiptCreation - Rendering component with selectedClient:", selectedClient);
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