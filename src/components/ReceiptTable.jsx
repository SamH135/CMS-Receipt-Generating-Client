import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import axiosInstance from '../axiosInstance';

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const ReceiptTable = forwardRef(({ clientType, clientID }, ref) => {
  const [tableData, setTableData] = useState({
    metals: {},
    weights: [],
    catalyticConverters: []
  });
  const [showCatalyticConverters, setShowCatalyticConverters] = useState(false);

  const updateLocalStorage = useCallback((newData) => {
    localStorage.setItem(`receiptData_${clientID}`, JSON.stringify(newData));
  }, [clientID]);

  const fetchPredefinedPrices = useCallback(async () => {
    if (!clientType) return;
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/rgc/metal-prices?clientType=${clientType}`);
      
      const initializeMetals = (prices) => {
        const initialMetals = Object.entries(prices).reduce((acc, [key, value]) => {
          acc[key] = { 
            price: value.toString(),
            isCustom: false,
            label: key
          };
          return acc;
        }, {});
        const newTableData = {
          metals: initialMetals,
          weights: Array(10).fill(Array(Object.keys(initialMetals).length).fill(0)),
          catalyticConverters: []
        };
        setTableData(newTableData);
        updateLocalStorage(newTableData);
      };

      initializeMetals(response.data);
    } catch (error) {
      console.error('Error fetching predefined prices:', error);
    }
  }, [clientType, updateLocalStorage]);

  useEffect(() => {
    if (clientType) {
      const storedData = localStorage.getItem(`receiptData_${clientID}`);
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          if (parsedData && parsedData.metals) {
            setTableData(parsedData);
          } else {
            fetchPredefinedPrices();
          }
        } catch (error) {
          console.error('Error parsing stored data:', error);
          fetchPredefinedPrices();
        }
      } else {
        fetchPredefinedPrices();
      }
    }

    const handleBeforeUnload = (event) => {
      const storedData = localStorage.getItem(`receiptData_${clientID}`);
      if (storedData) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [fetchPredefinedPrices, clientType, clientID]);

  const handlePriceChange = useCallback((metal, value) => {
    setTableData(prev => {
      const newData = {
        ...prev,
        metals: {
          ...prev.metals,
          [metal]: { 
            ...prev.metals[metal], 
            price: value
          }
        }
      };
      updateLocalStorage(newData);
      return newData;
    });
  }, [updateLocalStorage]);

  const handleWeightChange = useCallback((rowIndex, colIndex, value) => {
    setTableData(prev => {
      const newWeights = [...prev.weights];
      newWeights[rowIndex] = [...newWeights[rowIndex]];
      newWeights[rowIndex][colIndex] = value === '' ? 0 : parseFloat(value.replace(/^0+/, '')) || 0;
      const newData = { ...prev, weights: newWeights };
      updateLocalStorage(newData);
      return newData;
    });
  }, [updateLocalStorage]);

  const handleLabelChange = useCallback((metal, newLabel) => {
    setTableData(prev => {
      const newData = {
        ...prev,
        metals: {
          ...prev.metals,
          [metal]: { ...prev.metals[metal], label: newLabel.trim() || 'Custom Metal' }
        }
      };
      updateLocalStorage(newData);
      return newData;
    });
  }, [updateLocalStorage]);

  const addWeightRow = useCallback(() => {
    setTableData(prev => {
      const newData = {
        ...prev,
        weights: [...prev.weights, Array(Object.keys(prev.metals).length).fill(0)]
      };
      updateLocalStorage(newData);
      return newData;
    });
  }, [updateLocalStorage]);

  const addCustomMetal = useCallback(() => {
    setTableData(prev => {
      const metals = prev.metals || {};
      const newMetalKey = `custom_${Object.keys(metals).length + 1}`;
      const newData = {
        ...prev,
        metals: {
          ...metals,
          [newMetalKey]: { price: '0', isCustom: true, label: 'Custom Metal' }
        },
        weights: (prev.weights || []).map(row => [...row, 0])
      };
      updateLocalStorage(newData);
      return newData;
    });
  }, [updateLocalStorage]);

  const handleConverterChange = useCallback((index, field, value) => {
    setTableData(prev => {
      const newConverters = [...prev.catalyticConverters];
      newConverters[index] = { 
        ...newConverters[index], 
        [field]: field === 'partNumber' 
          ? value 
          : (value === '' ? 0 : parseFloat(value.replace(/^0+/, '')) || 0)
      };
      const newData = { ...prev, catalyticConverters: newConverters };
      updateLocalStorage(newData);
      return newData;
    });
  }, [updateLocalStorage]);

  const addCatalyticConverter = useCallback(() => {
    setTableData(prev => {
      const newData = {
        ...prev,
        catalyticConverters: [...prev.catalyticConverters, { partNumber: '', price: 0, percentFull: 100 }]
      };
      updateLocalStorage(newData);
      return newData;
    });
    setShowCatalyticConverters(true);
  }, [updateLocalStorage]);

  const calculateTotalWeight = useCallback((metalIndex) => {
    return tableData.weights.reduce((sum, row) => sum + (row[metalIndex] || 0), 0);
  }, [tableData.weights]);

  const calculateTotalPayout = useCallback(() => {
    const metalsPayout = Object.entries(tableData.metals).reduce((sum, [_, data], index) => {
      return sum + (parseFloat(data.price) || 0) * calculateTotalWeight(index);
    }, 0);
    const convertersPayout = tableData.catalyticConverters.reduce((sum, converter) => {
      return sum + converter.price * (converter.percentFull / 100);
    }, 0);
    return metalsPayout + convertersPayout;
  }, [tableData.metals, tableData.catalyticConverters, calculateTotalWeight]);

  useImperativeHandle(ref, () => ({
    getReceiptData: () => ({
      metals: Object.entries(tableData.metals).reduce((acc, [key, data], index) => {
        if (!data.isCustom) {
          acc[data.label] = {
            price: parseFloat(data.price) || 0,
            weight: calculateTotalWeight(index)
          };
        }
        return acc;
      }, {}),
      userDefinedMetals: Object.entries(tableData.metals).reduce((acc, [key, data], index) => {
        if (data.isCustom && data.label.trim() !== '' && data.label !== 'Custom Metal') {
          acc.push({
            name: data.label,
            price: parseFloat(data.price) || 0,
            weight: calculateTotalWeight(index)
          });
        }
        return acc;
      }, []),
      catalyticConverters: tableData.catalyticConverters,
      totalPayout: calculateTotalPayout(),
      totalVolume: Object.values(tableData.metals).reduce((sum, _, index) => sum + calculateTotalWeight(index), 0)
    }),
    clearLocalStorage: () => {
      localStorage.removeItem(`receiptData_${clientID}`);
    }
  }), [tableData, calculateTotalWeight, calculateTotalPayout, clientID]);

  const handleClearReceiptData = useCallback(() => {
    if (window.confirm("Are you sure you want to clear receipt data? You will lose all input for weights, custom metals, and catalytic converters if you do.")) {
      localStorage.removeItem(`receiptData_${clientID}`);
      fetchPredefinedPrices();
      setShowCatalyticConverters(false);  // Hide catalytic converter section
    }
  }, [clientID, fetchPredefinedPrices]);


  const renderTable = () => (
    <table className="table table-bordered">
      <thead>
        <tr>
          <th>Type</th>
          {Object.entries(tableData.metals).map(([key, data]) => (
            <th key={key}>
              {data.isCustom ? (
                <div
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleLabelChange(key, e.target.textContent)}
                  style={{
                    fontWeight: 'bold',
                    minWidth: '100px',
                    whiteSpace: 'nowrap',
                    overflow: 'visible'
                  }}
                >
                  {data.label}
                </div>
              ) : (
                data.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Price</strong></td>
          {Object.entries(tableData.metals).map(([metal, data]) => (
            <td key={metal}>
              <input
                type="text"
                value={data.price}
                onChange={(e) => handlePriceChange(metal, e.target.value)}
                className="form-control"
              />
              <span>${formatNumberWithCommas(parseFloat(data.price || 0).toFixed(2))}/lb</span>
            </td>
          ))}
        </tr>
        {tableData.weights.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td><strong>{rowIndex === 0 ? 'Weights' : ''}</strong></td>
            {row.map((weight, colIndex) => (
              <td key={colIndex}>
                <input
                  type="text"
                  value={weight === 0 ? '' : weight.toString()}
                  onChange={(e) => handleWeightChange(rowIndex, colIndex, e.target.value)}
                  className="form-control"
                />
              </td>
            ))}
          </tr>
        ))}
        <tr>
  <td><strong>Total Weight</strong></td>
  {Object.entries(tableData.metals).map(([metal, data], index) => (
    <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
      <strong>
        {formatNumberWithCommas(calculateTotalWeight(index).toFixed(2))} lbs
      </strong>
    </td>
  ))}
</tr>
      </tbody>
    </table>
  );

  const renderCatalyticConverters = () => (
    <div>
      <br />
      <br />
      <h3>Catalytic Converters</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Part Number or Name</th>
            <th>Price</th>
            <th>Percent Full</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {tableData.catalyticConverters.map((converter, index) => (
            <tr key={index}>
              <td>
                <input
                  type="text"
                  value={converter.partNumber}
                  onChange={(e) => handleConverterChange(index, 'partNumber', e.target.value)}
                  className="form-control"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={converter.price === 0 ? '' : converter.price.toString()}
                  onChange={(e) => handleConverterChange(index, 'price', e.target.value)}
                  className="form-control"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={converter.percentFull === 0 ? '' : `${converter.percentFull}%`}
                  onChange={(e) => {
                    const value = e.target.value.replace('%', '');
                    handleConverterChange(index, 'percentFull', value);
                  }}
                  className="form-control"
                  min="0"
                  max="100"
                />
              </td>
              <td>${formatNumberWithCommas((converter.price * (converter.percentFull / 100)).toFixed(2))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <br />
      <button 
        className="btn btn-danger" 
        onClick={handleClearReceiptData}
      >
        Clear Receipt Data
      </button>
      {renderTable()}
      <div className="mt-3">
        <button className="btn btn-secondary me-2" onClick={addWeightRow}>Add Weight Row</button>
        <button className="btn btn-secondary me-2" onClick={addCustomMetal}>Add Custom Metal</button>
        {clientType === 'auto' && (
          <button className="btn btn-secondary" onClick={addCatalyticConverter}>
            {showCatalyticConverters ? 'Add Another Catalytic Converter' : 'Add Catalytic Converter'}
          </button>
        )}
      </div>
      {clientType === 'auto' && showCatalyticConverters && renderCatalyticConverters()}
      <br />
      <h3 className="mt-3">Totals</h3>
      <p>Total Payout: ${formatNumberWithCommas(calculateTotalPayout().toFixed(2))}</p>
      <p>Total Volume: {formatNumberWithCommas(Object.values(tableData.metals).reduce((sum, _, index) => sum + calculateTotalWeight(index), 0).toFixed(2))} lbs</p>
    </div>
  );
});

export default ReceiptTable;