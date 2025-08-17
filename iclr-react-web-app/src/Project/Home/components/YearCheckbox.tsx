import React, { useState, useCallback, useMemo } from 'react';
import { useYear } from '../../../contexts/YearContext';
import { adminStyles } from '../styles/adminStyles';

interface YearCheckboxProps {
    selectedYear: string;
    onYearChange: (year: string) => void;
    isLoading?: boolean;
    className?: string;
    disabled?: boolean;
}

const YearCheckbox: React.FC<YearCheckboxProps> = ({
    selectedYear,
    onYearChange,
    isLoading = false,
    className = '',
    disabled = false
}) => {
    const { availableYears } = useYear();

    // Handle radio button change
    const handleRadioChange = useCallback((year: string) => {
        if (disabled || isLoading) return;
        onYearChange(year);
    }, [onYearChange, disabled, isLoading]);

    // Memoize radio button items to avoid unnecessary re-renders
    const radioItems = useMemo(() => {
        return availableYears.map((year, index) => {
            const isSelected = selectedYear === year;
            const isDisabled = disabled || isLoading;
            
            return (
                <div
                    key={index}
                    className={`form-check ${isDisabled ? 'opacity-50' : ''}`}
                    style={{
                        padding: '8px 12px',
                        margin: '4px 0',
                        borderRadius: '8px',
                        backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                        border: isSelected ? '1px solid #2196f3' : '1px solid transparent',
                        transition: 'all 0.2s ease',
                        cursor: isDisabled ? 'not-allowed' : 'pointer'
                    }}
                >
                    <input
                        className="form-check-input"
                        type="radio"
                        name="yearSelection"
                        id={`year-${index}`}
                        checked={isSelected}
                        onChange={() => handleRadioChange(year)}
                        disabled={isDisabled}
                        style={{
                            marginRight: '8px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }}
                    />
                    <label
                        className={`form-check-label ${isSelected ? 'fw-bold text-primary' : 'text-dark'}`}
                        htmlFor={`year-${index}`}
                        style={{
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            lineHeight: '1.4'
                        }}
                    >
                        {year}
                    </label>
                </div>
            );
        });
    }, [selectedYear, disabled, isLoading, handleRadioChange, availableYears]);

    return (
        <div className={`position-relative ${className}`}>
            <div className="card border-0 shadow-sm">
                <div className="card-header border-0 py-2" style={{
                    ...adminStyles.table.header,
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span> Year </span>
                        {isLoading && (
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-body p-3" style={{
                    maxHeight: '200px',
                    overflowY: 'auto'
                }}>
                    {radioItems}
                </div>
            </div>
        </div>
    );
};

export default YearCheckbox; 