// src/components/ReceiptTable.jsx
import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback, useRef } from 'react';
import axiosInstance from '../axiosInstance';

const formatNumberWithCommas = (number) => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const ReceiptTable = forwardRef(({ clientType, clientID }, ref) => {
  const [tableData, setTableData] = useState(() => {
    const savedData = localStorage.getItem(`receiptTableData_${clientID}`);
    return savedData ? JSON.parse(savedData) : {
      metals: {},
      weights: [],
      catalyticConverters: []
    };
  });

  const tableRef = useRef(null);

  const saveTableData = useCallback(() => {
    localStorage.setItem(`receiptTableData_${clientID}`, JSON.stringify(tableData));
  }, [tableData, clientID]);

  useEffect(() => {
    saveTableData();
  }, [tableData, saveTableData]);

  const fetchPredefinedPrices = useCallback(async () => {
    if (!clientType || Object.keys(tableData.metals).length > 0) return;
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/rgc/metal-prices?clientType=${clientType}`);
      initializeMetals(response.data);
    } catch (error) {
      console.error('Error fetching predefined prices:', error);
    }
  }, [clientType, tableData.metals]);

  useEffect(() => {
    fetchPredefinedPrices();
  }, [fetchPredefinedPrices]);

  const initializeMetals = (prices) => {
    const initialMetals = Object.entries(prices).reduce((acc, [key, value]) => {
      acc[key] = { 
        price: value.toString(),
        isCustom: false,
        label: key
      };
      return acc;
    }, {});
    setTableData(prev => ({
      ...prev,
      metals: initialMetals,
      weights: prev.weights.length > 0 ? prev.weights : Array(10).fill(Array(Object.keys(initialMetals).length).fill(''))
    }));
  };

  const handlePriceChange = (metal, value) => {
    setTableData(prev => ({
      ...prev,
      metals: {
        ...prev.metals,
        [metal]: { 
          ...prev.metals[metal], 
          price: value
        }
      }
    }));
  };

  const handleWeightChange = (rowIndex, colIndex, value) => {
    setTableData(prev => {
      const newWeights = [...prev.weights];
      newWeights[rowIndex] = [...newWeights[rowIndex]];
      newWeights[rowIndex][colIndex] = value;
      return { ...prev, weights: newWeights };
    });
  };

  const moveToNextCell = (currentRow, currentCol) => {
    const totalRows = tableData.weights.length;
    const totalCols = Object.keys(tableData.metals).length;

    let nextRow = currentRow + 1;
    let nextCol = currentCol;

    if (nextRow >= totalRows) {
      addWeightRow();
      nextRow = totalRows;
    }

    const nextInput = tableRef.current?.querySelector(
      `input[data-row="${nextRow}"][data-col="${nextCol}"]`
    );

    if (nextInput) {
      nextInput.focus();
    }
  };

  const handleWeightKeyDown = (event, rowIndex, colIndex) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      moveToNextCell(rowIndex, colIndex);
    }
  };

  const handleLabelChange = (metal, newLabel) => {
    setTableData(prev => ({
      ...prev,
      metals: {
        ...prev.metals,
        [metal]: { ...prev.metals[metal], label: newLabel.trim() || 'Custom Metal' }
      }
    }));
  };

  const addWeightRow = () => {
    setTableData(prev => ({
      ...prev,
      weights: [...prev.weights, Array(Object.keys(prev.metals).length).fill('')]
    }));
  };

  const addCustomMetal = () => {
    const newMetalKey = `custom_${Object.keys(tableData.metals).length + 1}`;
    setTableData(prev => ({
      ...prev,
      metals: {
        ...prev.metals,
        [newMetalKey]: { price: '', isCustom: true, label: 'Custom Metal' }
      },
      weights: prev.weights.map(row => [...row, ''])
    }));
  };

  const handleConverterChange = (index, field, value) => {
    setTableData(prev => {
      const newConverters = [...prev.catalyticConverters];
      newConverters[index] = { 
        ...newConverters[index], 
        [field]: field === 'partNumber' 
          ? value 
          : (value === '' ? '' : parseFloat(value) || '')
      };
      return { ...prev, catalyticConverters: newConverters };
    });
  };

  const addCatalyticConverter = () => {
    setTableData(prev => ({
      ...prev,
      catalyticConverters: [...prev.catalyticConverters, { partNumber: '', price: '', percentFull: '' }]
    }));
  };

  const calculateTotalWeight = (metalIndex) => {
    return tableData.weights.reduce((sum, row) => {
      const weight = row[metalIndex];
      const numericWeight = weight === '' ? 0 : parseFloat(weight) || 0;
      return sum + numericWeight;
    }, 0);
  };

  const calculateTotalPayout = () => {
    const metalsPayout = Object.entries(tableData.metals).reduce((sum, [_, data], index) => {
      return sum + (parseFloat(data.price) || 0) * calculateTotalWeight(index);
    }, 0);
    const convertersPayout = tableData.catalyticConverters.reduce((sum, converter) => {
      return sum + (parseFloat(converter.price) || 0) * ((parseFloat(converter.percentFull) || 0) / 100);
    }, 0);
    return metalsPayout + convertersPayout;
  };

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
    })
  }));

  const renderTable = () => (
    <table className="table table-bordered" ref={tableRef}>
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
                  value={weight}
                  onChange={(e) => handleWeightChange(rowIndex, colIndex, e.target.value)}
                  onKeyDown={(e) => handleWeightKeyDown(e, rowIndex, colIndex)}
                  className="form-control"
                  data-row={rowIndex}
                  data-col={colIndex}
                />
              </td>
            ))}
          </tr>
        ))}
        <tr>
          <td><strong>Total Weight</strong></td>
          {Object.keys(tableData.metals).map((_, index) => (
            <td key={index}><strong>{formatNumberWithCommas(calculateTotalWeight(index).toFixed(2))}</strong></td>
          ))}
        </tr>
      </tbody>
    </table>
  );

  const renderCatalyticConverters = () => (
    <div>
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
                  value={converter.price}
                  onChange={(e) => handleConverterChange(index, 'price', e.target.value)}
                  className="form-control"
                />
              </td>
              <td>
                <input
                  type="text"
                  value={converter.percentFull}
                  onChange={(e) => handleConverterChange(index, 'percentFull', e.target.value)}
                  className="form-control"
                  min="0"
                  max="100"
                />
              </td>
              <td>${formatNumberWithCommas((parseFloat(converter.price) || 0) * ((parseFloat(converter.percentFull) || 0) / 100).toFixed(2))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-secondary" onClick={addCatalyticConverter}>Add Catalytic Converter</button>
    </div>
  );

  return (
    <div>
      {renderTable()}
      <div className="mt-3">
        <button className="btn btn-secondary me-2" onClick={addWeightRow}>Add Weight Row</button>
        <button className="btn btn-secondary" onClick={addCustomMetal}>Add Custom Metal</button>
      </div>
      {clientType === 'auto' && renderCatalyticConverters()}
      <h3 className="mt-3">Totals</h3>
      <p>Total Payout: ${formatNumberWithCommas(calculateTotalPayout().toFixed(2))}</p>
      <p>Total Volume: {formatNumberWithCommas(Object.values(tableData.metals).reduce((sum, _, index) => sum + calculateTotalWeight(index), 0).toFixed(2))} lbs</p>
    </div>
  );
});

export default ReceiptTable;