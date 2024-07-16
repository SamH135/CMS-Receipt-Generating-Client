// components/ReceiptTable.jsx
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import axiosInstance from '../axiosInstance';

const ReceiptTable = forwardRef(({ clientType, clientID }, ref) => {
  const [metals, setMetals] = useState({});
  const [userDefinedMetals, setUserDefinedMetals] = useState([]);
  const [catalyticConverters, setCatalyticConverters] = useState([]);

  const fetchPredefinedPrices = useCallback(async () => {
    if (!clientType) {
      console.error("ReceiptTable - Client type is undefined, skipping price fetch");
      return;
    }
    try {
      console.log(`ReceiptTable - Fetching prices for client type: ${clientType}`);
      const url = `${process.env.REACT_APP_API_URL}/api/rgc/metal-prices?clientType=${clientType}`;
      console.log("ReceiptTable - Fetching from URL:", url);
      const response = await axiosInstance.get(url);
      console.log("ReceiptTable - Received prices:", response.data);
      initializeMetals(response.data);
    } catch (error) {
      console.error('ReceiptTable - Error fetching predefined prices:', error);
    }
  }, [clientType]);

  useEffect(() => {
    if (clientType) {
      fetchPredefinedPrices();
    }
  }, [fetchPredefinedPrices, clientType]);

  const initializeMetals = (prices) => {
    const initialMetals = {};
    Object.entries(prices).forEach(([metal, price]) => {
      initialMetals[metal] = { weight: 0, price: price };
    });
    setMetals(initialMetals);
  };

  const handleMetalChange = (metal, field, value) => {
    setMetals(prevMetals => ({
      ...prevMetals,
      [metal]: { ...prevMetals[metal], [field]: parseFloat(value) || 0 }
    }));
  };

  const handleUserDefinedMetalChange = (index, field, value) => {
    const updatedMetals = [...userDefinedMetals];
    updatedMetals[index][field] = field === 'name' ? value : parseFloat(value) || 0;
    setUserDefinedMetals(updatedMetals);
  };

  const handleConverterChange = (index, field, value) => {
    const updatedConverters = [...catalyticConverters];
    updatedConverters[index][field] = field === 'partNumber' ? value : parseFloat(value) || 0;
    setCatalyticConverters(updatedConverters);
  };

  const addUserDefinedMetal = () => {
    setUserDefinedMetals([...userDefinedMetals, { name: '', price: 0, weight: 0 }]);
  };

  const addCatalyticConverter = () => {
    setCatalyticConverters([...catalyticConverters, { partNumber: '', price: 0, percentFull: 100 }]);
  };

  const calculateTotalPayout = () => {
    const metalsPayout = Object.values(metals).reduce((sum, metal) => sum + metal.price * metal.weight, 0);
    const userDefinedPayout = userDefinedMetals.reduce((sum, metal) => sum + metal.price * metal.weight, 0);
    const convertersPayout = catalyticConverters.reduce((sum, converter) => sum + converter.price * (converter.percentFull / 100), 0);
    return metalsPayout + userDefinedPayout + convertersPayout;
  };

  const calculateTotalVolume = () => {
    const metalsVolume = Object.values(metals).reduce((sum, metal) => sum + metal.weight, 0);
    const userDefinedVolume = userDefinedMetals.reduce((sum, metal) => sum + metal.weight, 0);
    return metalsVolume + userDefinedVolume;
  };

  useImperativeHandle(ref, () => ({
    calculateTotalPayout,
    calculateTotalVolume,
    getMetals: () => metals,
    getUserDefinedMetals: () => userDefinedMetals,
    getCatalyticConverters: () => catalyticConverters,
  }));

  return (
    <div>
      <h3>Predefined Metals</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Metal</th>
            <th>Price</th>
            <th>Weight</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(metals).map(([metal, data]) => (
            <tr key={metal}>
              <td>{metal}</td>
              <td>
                <input
                  type="number"
                  value={data.price}
                  onChange={(e) => handleMetalChange(metal, 'price', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={data.weight}
                  onChange={(e) => handleMetalChange(metal, 'weight', e.target.value)}
                />
              </td>
              <td>{(data.price * data.weight).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>User-Defined Metals</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Metal</th>
            <th>Price</th>
            <th>Weight</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {userDefinedMetals.map((metal, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={metal.name}
                  onChange={(e) => handleUserDefinedMetalChange(index, 'name', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={metal.price}
                  onChange={(e) => handleUserDefinedMetalChange(index, 'price', e.target.value)}
                />
              </td>
              <td>
                <input
                  type="number"
                  value={metal.weight}
                  onChange={(e) => handleUserDefinedMetalChange(index, 'weight', e.target.value)}
                />
              </td>
              <td>{(metal.price * metal.weight).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addUserDefinedMetal}>Add User-Defined Metal</button>

      {clientType === 'auto' && (
        <>
          <h3>Catalytic Converters</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Price</th>
                <th>Percent Full</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {catalyticConverters.map((converter, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={converter.partNumber}
                      onChange={(e) => handleConverterChange(index, 'partNumber', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={converter.price}
                      onChange={(e) => handleConverterChange(index, 'price', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={converter.percentFull}
                      onChange={(e) => handleConverterChange(index, 'percentFull', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </td>
                  <td>{(converter.price * (converter.percentFull / 100)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addCatalyticConverter}>Add Catalytic Converter</button>
        </>
      )}

      <h3>Totals</h3>
      <p>Total Payout: ${calculateTotalPayout().toFixed(2)}</p>
      <p>Total Volume: {calculateTotalVolume().toFixed(2)} lbs</p>
    </div>
  );
});

export default ReceiptTable;