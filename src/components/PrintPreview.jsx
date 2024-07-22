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
    // Clear localStorage when component mounts, in case user refreshes before printing
    if (receiptData && receiptData.clientID) {
      localStorage.removeItem(`receiptTableData_${receiptData.clientID}`);
      localStorage.removeItem(`receiptData_${receiptData.clientID}`);
    }
    localStorage.removeItem('selectedClient');
  }, [receiptData]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    onAfterPrint: () => {
      // Clear any remaining localStorage data
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

  return (
    <div className="container mt-5">
      <h2>Receipt Preview</h2>
      <div ref={componentRef}>
        <h3>Client: {receiptData.clientName} (ID: {receiptData.clientID})</h3>
        <h4>Client Type: {receiptData.clientType}</h4>
        <h4>Total Payout: ${receiptData.totalPayout.toFixed(2)}</h4>
        <h4>Total Volume: {receiptData.totalVolume.toFixed(2)} lbs</h4>
        <h4>Created By: {receiptData.createdBy}</h4>
        
        <h5>Metals:</h5>
        <ul>
          {Object.entries(receiptData.metals).map(([metal, data]) => (
            <li key={metal}>{metal}: {data.weight} lbs @ ${data.price}/lb</li>
          ))}
        </ul>

        {receiptData.userDefinedMetals.length > 0 && (
          <>
            <h5>Custom Metals:</h5>
            <ul>
              {receiptData.userDefinedMetals.map((metal, index) => (
                <li key={index}>{metal.name}: {metal.weight} lbs @ ${metal.price}/lb</li>
              ))}
            </ul>
          </>
        )}

        {receiptData.clientType === 'auto' && receiptData.catalyticConverters.length > 0 && (
          <>
            <h5>Catalytic Converters:</h5>
            <ul>
              {receiptData.catalyticConverters.map((converter, index) => (
                <li key={index}>Part Number: {converter.partNumber}, Price: ${converter.price}, Percent Full: {converter.percentFull}%</li>
              ))}
            </ul>
          </>
        )}

        <h4>Receipt ID: {receiptData.receiptID}</h4>
      </div>
      <button className="btn btn-primary mt-3" onClick={handlePrint}>Print Receipt</button>
    </div>
  );
};

export default PrintPreview;