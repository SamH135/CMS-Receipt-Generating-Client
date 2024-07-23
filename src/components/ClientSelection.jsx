// components/ClientSelection.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axiosInstance from '../axiosInstance';
import Table from './Table';
import { setSelectedClient } from '../redux/actions/authActions';

const ClientSelection = () => {
  const token = useSelector((state) => state.auth.token);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) {
      navigate('/rgc-login');
    } else {
      fetchClients();
    }
  }, [token, navigate]);

  const fetchClients = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/rgc/clientList`);
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error retrieving clients:', error);
    }
  };
  
  const handleSearch = async () => {
    try {
      const response = await axiosInstance.get(`${process.env.REACT_APP_API_URL}/api/rgc/searchClients?term=${encodeURIComponent(searchTerm)}`);
      setClients(response.data.clients);
    } catch (error) {
      console.error('Error searching clients:', error);
    }
  };

  const handleClientClick = (client) => {
    dispatch(setSelectedClient(client));
    localStorage.setItem('selectedClient', JSON.stringify(client));
    navigate('/receipt-creation');
  };

  return (
    <div>
      <nav>
        <h4>RGC Receipt Creation</h4>
        {/* <ul>
          <li><Link to="/rgc-dashboard">Dashboard</Link></li>
          <li><Link to="/rgc-logout">Logout</Link></li>
        </ul> */}
      </nav>

      <div className="container mt-4">
        <div className="card">
          <div className="card-header text-center d-flex justify-content-center align-items-center">
            <img src="/client_list_button_icon.png" alt="Client icon" className="card-icon me-2" />
            <strong>Select client to make a receipt</strong>
          </div>
          <div className="card-body">
            <div className="search-container">
              <input 
                type="text" 
                id="searchInput" 
                className="form-control" 
                placeholder="Search by client name, ID, or location" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
              />
              <img 
                src="/search_button_icon.png" 
                alt="Search" 
                className={`search-icon ${searchTerm ? 'hidden' : ''}`}
                onClick={handleSearch}
              />
              <img 
                src="/close_button_icon.png" 
                alt="Clear" 
                className={`clear-icon ${searchTerm ? '' : 'hidden'}`}
                onClick={() => {
                  setSearchTerm('');
                  fetchClients();
                }}
              />
            </div>
            <Table
              columns={[
                { header: 'Client ID', field: 'clientid' },
                { header: 'Client Name', field: 'clientname' },
                { header: 'Location', field: 'clientlocation' },
              ]}
              data={clients}
              onRowClick={handleClientClick}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSelection;