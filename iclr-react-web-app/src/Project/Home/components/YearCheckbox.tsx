import React, { useState, useCallback, useMemo } from 'react';
import { useYear } from '../../../contexts/YearContext';
import { adminStyles, getTooltipArrowStyle } from '../styles/adminStyles';

interface YearCheckboxProps {
    selectedYears: string[];
    onYearChange: (years: string[]) => void;
    isLoading?: boolean;
    showTooltip?: boolean;
    tooltipPosition?: 'left' | 'right';
    className?: string;
    disabled?: boolean;
    maxSelections?: number;
}

const YearCheckbox: React.FC<YearCheckboxProps> = ({
    selectedYears,
    onYearChange,
    isLoading = false,
    showTooltip = true,
    tooltipPosition = 'left',
    className = '',
    disabled = false,
    maxSelections = 4
}) => {
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const [tooltipCoords, setTooltipCoords] = useState<{x: number, y: number}>({x: 0, y: 0});
    const [tooltipContent, setTooltipContent] = useState<string>("");

    const { availableYears } = useYear();

    // Handle checkbox change
    const handleCheckboxChange = useCallback((year: string, checked: boolean) => {
        if (disabled || isLoading) return;

        let newSelectedYears: string[];
        
        if (checked) {
            // Add year if under max limit
            if (selectedYears.length < maxSelections) {
                newSelectedYears = [...selectedYears, year];
            } else {
                // Replace the last selected year
                newSelectedYears = [...selectedYears.slice(0, -1), year];
            }
        } else {
            // Remove year
            newSelectedYears = selectedYears.filter(y => y !== year);
        }
        
        onYearChange(newSelectedYears);
    }, [selectedYears, onYearChange, disabled, isLoading, maxSelections]);

    // Handle tooltip
    const handleMouseEnter = useCallback((event: React.MouseEvent, year: string) => {
        if (!showTooltip || disabled || isLoading) return;
        
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipCoords({
            x: tooltipPosition === 'left' ? rect.left - 10 : rect.right + 10,
            y: rect.top + rect.height / 2
        });
        setTooltipContent(year);
        setTooltipVisible(true);
    }, [showTooltip, tooltipPosition, disabled, isLoading]);

    const handleMouseLeave = useCallback(() => {
        setTooltipVisible(false);
    }, []);

    // Memoize checkbox items to avoid unnecessary re-renders
    const checkboxItems = useMemo(() => {
        return availableYears.map((year, index) => {
            const isSelected = selectedYears.includes(year);
            const isDisabled = disabled || isLoading || (!isSelected && selectedYears.length >= maxSelections);
            
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
                    onMouseEnter={(e) => handleMouseEnter(e, year)}
                    onMouseLeave={handleMouseLeave}
                >
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`year-${index}`}
                        checked={isSelected}
                        onChange={(e) => handleCheckboxChange(year, e.target.checked)}
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
    }, [selectedYears, disabled, isLoading, maxSelections, handleCheckboxChange, handleMouseEnter, handleMouseLeave, availableYears]);

    return (
        <div className={`position-relative ${className}`}>
            <div className="card border-0 shadow-sm">
                <div className="card-header border-0 py-2" style={{
                    ...adminStyles.table.header,
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span> Years </span>
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
                    {checkboxItems}
                </div>
            </div>

            {/* Tooltip */}
            {showTooltip && tooltipVisible && (
                <div 
                    style={{
                        ...adminStyles.tooltip.dropdown,
                        left: tooltipCoords.x,
                        top: tooltipCoords.y,
                        transform: tooltipPosition === 'left' 
                            ? 'translateX(-100%) translateY(-50%)' 
                            : 'translateY(-50%)',
                        zIndex: 1000
                    }}
                >
                    <div style={adminStyles.tooltip.title}>
                        Year:
                    </div>
                    <div style={adminStyles.tooltip.content}>
                        {tooltipContent}
                    </div>
                    <div 
                        style={{
                            ...adminStyles.tooltip.arrow,
                            ...getTooltipArrowStyle(tooltipPosition)
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default YearCheckbox; 