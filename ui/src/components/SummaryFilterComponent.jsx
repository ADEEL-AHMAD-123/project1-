import React from 'react';
import '../styles/FilterComponent.scss'; // Import styles for this component

const formatDate = (date) => {
  if (!date) return '';
  const [year, month, day] = date.split('-');
  return `${year.slice(2)}-${month}-${day}`;
};

const FilterComponent = ({ filters, onFilterChange, onApplyFilters }) => {
  // Format dates for display in yyyy-mm-dd format
  const formattedStartDate = formatDate(filters.startDate);
  const formattedEndDate = formatDate(filters.endDate);

  return (
    <div className="filters">
      <div className="date-filter">
        <input
          type="date"
          name="startDate"
          value={formattedStartDate}
          onChange={onFilterChange}
          placeholder="Start Date"
        />
        <label htmlFor="startDate" className="placeholder">
          Start Date
        </label>
      </div>
      <div className="date-filter">
        <input
          type="date"
          name="endDate"
          value={formattedEndDate}
          onChange={onFilterChange}
          placeholder="End Date"
        />
        <label htmlFor="endDate" className="placeholder">
          End Date
        </label>
      </div>
      <input
        type="text"
        name="level"
        placeholder="Level"
        value={filters.level}
        onChange={onFilterChange}
      />
      <input
        type="text"
        name="ip"
        placeholder="IP Address"
        value={filters.ip}
        onChange={onFilterChange}
      />
      <button onClick={onApplyFilters}>Apply Filters</button>
    </div>
  );
};

export default FilterComponent;
