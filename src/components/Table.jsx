// src/components/Table.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Table = ({ columns, data, onRowClick }) => {
  return (
    <table className="table table-hover" style={{ borderRadius: '6px', overflow: 'hidden' }}>
      <thead>
        <tr>
          {columns.map((column, index) => (
            <th key={index}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} onClick={() => onRowClick && onRowClick(row)}>
            {columns.map((column, columnIndex) => (
              <td key={columnIndex}>{row[column.field]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;