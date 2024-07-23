// PrintPreview.jsx
import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';


const PrintPreview = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { receiptData } = location.state || {};
  const componentRef = useRef();

  useEffect(() => {
    if (receiptData && receiptData.clientID) {
      localStorage.removeItem(`receiptTableData_${receiptData.clientID}`);
      localStorage.removeItem(`receiptData_${receiptData.clientID}`);
    }
    localStorage.removeItem('selectedClient');
  }, [receiptData]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      if (receiptData && receiptData.clientID) {
        localStorage.removeItem(`receiptTableData_${receiptData.clientID}`);
        localStorage.removeItem(`receiptData_${receiptData.clientID}`);
      }
      localStorage.removeItem('selectedClient');
      navigate('/client-selection');
    },
  });

  if (!receiptData) {
    return <div>No receipt data available</div>;
  }

  const ReceiptContent = () => (
    <div className="receipt-page">
      <h2 className="receipt-title">Official Receipt</h2>
      <div className="receipt-header">
        <h3>Client: {receiptData.clientName} (ID: {receiptData.clientID})</h3>
        <h4>Client Type: {receiptData.clientType}</h4>
        <h4>Receipt ID: {receiptData.receiptID}</h4>
        <h4>Date: {new Date().toLocaleDateString()}</h4>
      </div>
      <div className="receipt-separator">__________________________________________________________</div>
      
      <div className="receipt-body">
        <h4>Metals:</h4>
        <ul>
          {Object.entries(receiptData.metals).map(([metal, data]) => (
            <li key={metal}>{metal}: {data.weight} lbs @ ${data.price}/lb = ${(data.weight * data.price).toFixed(2)}</li>
          ))}
        </ul>

        {receiptData.userDefinedMetals.length > 0 && (
          <>
            <h4>Custom Metals:</h4>
            <ul>
              {receiptData.userDefinedMetals.map((metal, index) => (
                <li key={index}>{metal.name}: {metal.weight} lbs @ ${metal.price}/lb = ${(metal.weight * metal.price).toFixed(2)}</li>
              ))}
            </ul>
          </>
        )}

        {receiptData.clientType === 'auto' && receiptData.catalyticConverters.length > 0 && (
          <>
            <h4>Catalytic Converters:</h4>
            <ul>
              {receiptData.catalyticConverters.map((converter, index) => (
                <li key={index}>Part Number: {converter.partNumber}, Price: ${converter.price}, Percent Full: {converter.percentFull}% = ${(converter.price * converter.percentFull / 100).toFixed(2)}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="receipt-separator">__________________________________________________________</div>
      
      <div className="receipt-summary">
        <h4>Total Volume: {receiptData.totalVolume.toFixed(2)} lbs</h4>
        <h4>Total Payout: ${receiptData.totalPayout.toFixed(2)}</h4>
      </div>
      
      <div className="receipt-footer">
        <p>Created By: {receiptData.createdBy}</p>
        <div className="receipt-signature">
          <p>Customer Signature: _____________________________</p>
          <p>Date: ________________</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mt-5">
      <div ref={componentRef}>
        <ReceiptContent />
        <div className="page-break" />
        <ReceiptContent />
      </div>
      <button className="btn btn-primary mt-3" onClick={handlePrint}>Print Receipt</button>
    </div>
  );
};

export default PrintPreview;