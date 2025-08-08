import React from 'react';
import { useYear } from '../contexts/YearContext';
import './YearSelector.css';

interface YearSelectorProps {
  className?: string;
  showLabel?: boolean;
}

const YearSelector: React.FC<YearSelectorProps> = ({ className = '', showLabel = true }) => {
  const { currentYear, availableYears, setYear, loading } = useYear();

  const handleYearChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = event.target.value;
    if (newYear !== currentYear) {
      const success = await setYear(newYear);
      if (!success) {
        // You could add a toast notification here
        console.error('Failed to change year');
      }
    }
  };

  if (loading) {
    return <div className={`year-selector-loading ${className}`}>Loading...</div>;
  }

  return (
    <div className={`year-selector ${className}`}>
      {showLabel && <label htmlFor="year-select">Year: </label>}
      <select
        id="year-select"
        value={currentYear}
        onChange={handleYearChange}
        className="year-select"
      >
        {availableYears.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearSelector; 