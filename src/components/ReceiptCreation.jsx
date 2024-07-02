// components/ReceiptCreation.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const ReceiptCreation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, client } = location.state;
  const [metalPrices, setMetalPrices] = useState({});
  const [receiptData, setReceiptData] = useState({});
  const [customMetals, setCustomMetals] = useState([]);
  const [catalyticConverters, setCatalyticConverters] = useState([]);

  useEffect(() => {
    fetchMetalPrices();
  }, []);

  const fetchMetalPrices = async () => {
    try {
      const response = await axiosInstance.get(`/api/rgc/metal-prices?clientType=${client.clienttype}`);
      setMetalPrices(response.data);
      initializeReceiptData(response.data);
    } catch (error) {
      console.error('Error fetching metal prices:', error);
    }
  };

  const initializeReceiptData = (prices) => {
    const data = {};
    Object.keys(prices).forEach(metal => {
      data[metal] = { weight: 0, price: prices[metal] };
    });
    setReceiptData(data);
  };

  const handleWeightChange = (metal, weight) => {
    setReceiptData(prev => ({
      ...prev,
      [metal]: { ...prev[metal], weight: parseFloat(weight) || 0 }
    }));
  };

  const handlePriceChange = (metal, price) => {
    setReceiptData(prev => ({
      ...prev,
      [metal]: { ...prev[metal], price: parseFloat(price) || 0 }
    }));
  };

  const addCustomMetal = () => {
    setCustomMetals([...customMetals, { name: '', weight: 0, price: 0 }]);
  };

  const handleCustomMetalChange = (index, field, value) => {
    const updatedCustomMetals = [...customMetals];
    updatedCustomMetals[index][field] = value;
    setCustomMetals(updatedCustomMetals);
  };

  const addCatalyticConverter = () => {
    setCatalyticConverters([...catalyticConverters, { partNumber: '', price: 0, percentFull: 100 }]);
  };

  const handleConverterChange = (index, field, value) => {
    const updatedConverters = [...catalyticConverters];
    updatedConverters[index][field] = value;
    setCatalyticConverters(updatedConverters);
  };

  const calculateTotalPayout = () => {
    let total = 0;
    Object.values(receiptData).forEach(metal => {
      total += metal.weight * metal.price;
    });
    customMetals.forEach(metal => {
      total += metal.weight * metal.price;
    });
    catalyticConverters.forEach(converter => {
      total += converter.price * (converter.percentFull / 100);
    });
    return total.toFixed(2);
  };

  const handleSubmit = () => {
    const receiptInfo = {
      clientID: client.clientid,
      createdBy: user,
      totalPayout: calculateTotalPayout(),
      metals: receiptData,
      catalyticConverters,
      userDefinedMetals: customMetals,
    };
    navigate('/print-preview', { state: { receiptInfo } });
  };

  return (
    <div className="container mt-5">
      <h2>Create Receipt for {client.clientname}</h2>
      <form>
        {Object.entries(receiptData).map(([metal, data]) => (
          <div key={metal} className="form-row mb-3">
            <div className="col">
              <label>{metal}</label>
              <input
                type="number"
                className="form-control"
                value={data.weight}
                onChange={(e) => handleWeightChange(metal, e.target.value)}
                placeholder="Weight"
              />
            </div>
            <div className="col">
              <label>Price</label>
              <input
                type="number"
                className="form-control"
                value={data.price}
                onChange={(e) => handlePriceChange(metal, e.target.value)}
                placeholder="Price"
              />
            </div>
          </div>
        ))}

        <h3>Custom Metals</h3>
        {customMetals.map((metal, index) => (
          <div key={index} className="form-row mb-3">
            <div className="col">
              <input
                type="text"
                className="form-control"
                value={metal.name}
                onChange={(e) => handleCustomMetalChange(index, 'name', e.target.value)}
                placeholder="Metal Name"
              />
            </div>
            <div className="col">
              <input
                type="number"
                className="form-control"
                value={metal.weight}
                onChange={(e) => handleCustomMetalChange(index, 'weight', e.target.value)}
                placeholder="Weight"
              />
            </div>
            <div className="col">
              <input
                type="number"
                className="form-control"
                value={metal.price}
                onChange={(e) => handleCustomMetalChange(index, 'price', e.target.value)}
                placeholder="Price"
              />
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-secondary mb-3" onClick={addCustomMetal}>Add Custom Metal</button>

        {client.clienttype === 'auto' && (
          <>
            <h3>Catalytic Converters</h3>
            {catalyticConverters.map((converter, index) => (
              <div key={index} className="form-row mb-3">
                <div className="col">
                  <input
                    type="text"
                    className="form-control"
                    value={converter.partNumber}
                    onChange={(e) => handleConverterChange(index, 'partNumber', e.target.value)}
                    placeholder="Part Number"
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control"
                    value={converter.price}
                    onChange={(e) => handleConverterChange(index, 'price', e.target.value)}
                    placeholder="Price"
                  />
                </div>
                <div className="col">
                  <input
                    type="number"
                    className="form-control"
                    value={converter.percentFull}
                    onChange={(e) => handleConverterChange(index, 'percentFull', e.target.value)}
                    placeholder="Percent Full"
                  />
                </div>
              </div>
            ))}
            <button type="button" className="btn btn-secondary mb-3" onClick={addCatalyticConverter}>Add Catalytic Converter</button>
          </>
        )}

        <div className="mt-3">
          <h4>Total Payout: ${calculateTotalPayout()}</h4>
        </div>

        <button type="button" className="btn btn-primary" onClick={handleSubmit}>Create Receipt</button>
      </form>
    </div>
  );
};

export default ReceiptCreation;
