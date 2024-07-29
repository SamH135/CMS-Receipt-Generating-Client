// ReceiptCreation.jsx
import React, { useRef, useEffect } from 'react';
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

  const handleSubmit = async () => {
    if (!selectedClient || !receiptTableRef.current) {
      console.error('Missing client or receipt table data');
      return;
    }
  
    try {
      const receiptData = {
        clientID: selectedClient.clientid,
        clientName: selectedClient.clientname,
        clientType: selectedClient.clienttype,
        createdBy,
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