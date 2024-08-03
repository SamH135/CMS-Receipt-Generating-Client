// ReceiptCreation.jsx
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

  const handleSubmit = () => {
    if (!selectedClient || !receiptTableRef.current) {
      console.error('Missing client or receipt table data');
      return;
    }
    setShowModal(true);
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
      <button className="btn btn-primary mt-3" onClick={handleSubmit}>Create Receipt</button>

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