// src/components/PrintPreview.jsx

import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';

const PrintPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { receiptData } = location.state || {};
  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @page {
        size: letter;
        margin: 0.5in;
      }
    `,
    onAfterPrint: () => {
      localStorage.removeItem(`receiptTableData_${receiptData.clientID}`);
      localStorage.removeItem(`receiptData_${receiptData.clientID}`);
      localStorage.removeItem('selectedClient');
      navigate('/client-selection');
    },
  });

  if (!receiptData) {
    return <div>No receipt data available</div>;
  }

  const ReceiptContent = ({ isCustomerCopy }) => (
    <div className="receipt-page">
      <h1 className="company-name">Sivils Core Buying and Metal Recycling</h1>
      <p className="phone-number">512-845-3533</p>
      <div className="receipt-header">
        <p><strong>Client:</strong> {receiptData.clientName} (ID: {receiptData.clientID})</p>
        <p><strong>Location:</strong> {receiptData.clientLocation}</p>
        <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
      </div>
      
      <table className="metals-table">
        <thead>
          <tr>
            <th>Metal</th>
            <th>Weight (lbs)</th>
            {(!isCustomerCopy || !receiptData.isCorporate) && (
              <>
                <th>Price/lb</th>
                <th>Total</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {Object.entries(receiptData.metals).map(([metal, data]) => (
            <tr key={metal}>
              <td>{metal}</td>
              <td>{data.weight}</td>
              {(!isCustomerCopy || !receiptData.isCorporate) && (
                <>
                  <td>${data.price}</td>
                  <td>${(data.weight * data.price).toFixed(2)}</td>
                </>
              )}
            </tr>
          ))}
          {receiptData.userDefinedMetals.map((metal, index) => (
            <tr key={`custom-${index}`}>
              <td>{metal.name}</td>
              <td>{metal.weight}</td>
              {(!isCustomerCopy || !receiptData.isCorporate) && (
                <>
                  <td>${metal.price}</td>
                  <td>${(metal.weight * metal.price).toFixed(2)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="receipt-summary">
        <p><strong>Total Volume:</strong> {receiptData.totalVolume.toFixed(2)} lbs</p>
        {(!isCustomerCopy || !receiptData.isCorporate) && (
          <p><strong>Total Payout:</strong> ${receiptData.totalPayout.toFixed(2)}</p>
        )}
      </div>
      
      <div className="receipt-footer">
        <p>Customer Signature: _____________________________</p>
      </div>
    </div>
  );

  return (
    <div className="print-preview-container">
      <div ref={componentRef}>
        <ReceiptContent isCustomerCopy={false} />
        <div style={{ pageBreakBefore: 'always' }}></div>
        <ReceiptContent isCustomerCopy={true} />
      </div>
      <button className="btn btn-primary mt-3" onClick={handlePrint}>Print Receipt</button>
    </div>
  );
};

export default PrintPreview;