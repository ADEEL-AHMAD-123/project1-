import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterComponent from '../components/FilterComponent'; // Import the reusable FilterComponent
import ErrorCard from '../components/ErrorCard';
import '../styles/ListingTable.scss'; // Import SCSS file for styling

const UsageSummary = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    startDate: '',
    endDate: '',
    username: '',
  });

  // Hardcoded usage data
  const usageData = [
    {
      _id: '1',
      date: '2024-08-01',
      username: 'john.doe',
      durationMin: '120',
      aloc: '50',
      allCalls: '150',
      answered: '120',
      failed: '30',
      buyPrice: '$0.05',
      sellPrice: '$0.10',
      markup: '$0.05',
      asr: '80%'
    },
    {
      _id: '2',
      date: '2024-08-02',
      username: 'jane.smith',
      durationMin: '90',
      aloc: '40',
      allCalls: '120',
      answered: '100',
      failed: '20',
      buyPrice: '$0.06',
      sellPrice: '$0.11',
      markup: '$0.05',
      asr: '85%'
    },
    // Add more hardcoded data as needed
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleRowClick = (id) => {
    navigate(`/usage/${id}`); // Navigate to usage detail page
  };

  if (!usageData.length) {
    return (
      <div className="container usage-summary">
        <h1 className="message">No usage data available.</h1>
      </div>
    );
  }

  return (
    <div className="container usage-summary">
      <FilterComponent filters={filters} setFilters={setFilters} />

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Username</th>
              <th>Duration/Min</th>
              <th>ALOC</th>
              <th>All Calls</th>
              <th>Answered</th>
              <th>Failed</th>
              <th>Buy Price</th>
              <th>Sell Price</th>
              <th>Markup</th>
              <th>ASR</th>
            </tr>
          </thead>
          <tbody>
            {usageData.map((data) => (
              <tr key={data._id} onClick={() => handleRowClick(data._id)}>
                <td>{formatDate(data.date)}</td>
                <td>{data.username}</td>
                <td>{data.durationMin}</td>
                <td>{data.aloc}</td>
                <td>{data.allCalls}</td>
                <td>{data.answered}</td>
                <td>{data.failed}</td>
                <td>{data.buyPrice}</td>
                <td>{data.sellPrice}</td>
                <td>{data.markup}</td>
                <td>{data.asr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsageSummary;
