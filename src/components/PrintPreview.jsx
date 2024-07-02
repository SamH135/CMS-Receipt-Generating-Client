// components/PrintPreview.jsx
import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import axiosInstance from '../axiosInstance';

const PrintPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { receiptInfo } = location.state;
  const componentRef = useRef();

  const handleSubmitReceipt = async () => {
    try {
      await axiosInstance.post(`${process.env.REACT_APP_API_URL}/api/rgc/receipts`, receiptInfo);
      navigate('/client-selection');
    } catch (error) {
      console.error('Error submitting receipt:', error);
      alert('Failed to submit receipt. Please try again.');
    }
  };
  
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: handleSubmitReceipt,
  });

  return (
    <div className="container mt-5">
      <h2>Receipt Preview</h2>
      <div ref={componentRef}>
        <h3>Client: {receiptInfo.clientID}</h3>
        <h4>Total Payout: ${receiptInfo.totalPayout}</h4>
        <h4>Created By: {receiptInfo.createdBy}</h4>
        
        <h5>Metals:</h5>
        <ul>
          {Object.entries(receiptInfo.metals).map(([metal, data]) => (
            <li key={metal}>{metal}: {data.weight} lbs @ ${data.price}/lb</li>
          ))}
        </ul>

        {receiptInfo.userDefinedMetals.length > 0 && (
          <>
            <h5>Custom Metals:</h5>
            <ul>
              {receiptInfo.userDefinedMetals.map((metal, index) => (
                <li key={index}>{metal.name}: {metal.weight} lbs @ ${metal.price}/lb</li>
              ))}
            </ul>
          </>
        )}

        {receiptInfo.catalyticConverters.length > 0 && (
          <>
            <h5>Catalytic Converters:</h5>
            <ul>
              {receiptInfo.catalyticConverters.map((converter, index) => (
                <li key={index}>Part Number: {converter.partNumber}, Price: ${converter.price}, Percent Full: {converter.percentFull}%</li>
              ))}
            </ul>
          </>
        )}
      </div>
      <button className="btn btn-primary mt-3" onClick={handlePrint}>Print and Submit</button>
    </div>
  );
};

export default PrintPreview;