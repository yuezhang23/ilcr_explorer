import React from 'react';
import { useYear } from '../../../contexts/YearContext';
import { adminStyles } from '../styles/adminStyles';
import { dropdownStyles } from './dropdownStyles';

interface YearDropdownProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

const YearDropdown: React.FC<YearDropdownProps> = ({
  selectedYear,
  onYearChange,
  isLoading = false,
  className = '',
  disabled = false
}) => {
  const { availableYears } = useYear();

  return (
    <div className={`year-dropdown ${className}`}>
      <select
        className="form-select"
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        disabled={disabled || isLoading}
        style={{
          ...dropdownStyles,
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          fontWeight: '700'
        }}
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

export default YearDropdown; 