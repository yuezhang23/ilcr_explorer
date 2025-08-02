import React, { useState, useCallback } from 'react';
import { useYear } from '../../../contexts/YearContext';
import { adminStyles, getDropdownMenuStyle } from '../styles/adminStyles';

interface ConferenceDropdownProps {
    className?: string;
    buttonStyle?: React.CSSProperties;
    label?: string;
    showLabel?: boolean;
}

const ConferenceDropdown: React.FC<ConferenceDropdownProps> = ({
    className = '',
    buttonStyle = {},
    label = 'ICLR',
    showLabel = true
}) => {
    const [conferenceDropdownOpen, setConferenceDropdownOpen] = useState<boolean>(false);
    const { currentYear, availableYears, setYear: setGlobalYear } = useYear();

    // Add click outside handler for dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (conferenceDropdownOpen && !target.closest('.conference-dropdown-container')) {
                setConferenceDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [conferenceDropdownOpen]);

    const handleYearSelect = useCallback(async (year: string) => {
        const success = await setGlobalYear(year);
        if (success) {
            setConferenceDropdownOpen(false);
        }
    }, [setGlobalYear]);

    const defaultButtonStyle = {
        borderRadius: '8px',
        padding: '6px 12px',
        color: '#1e40af',
        backgroundColor: '#dbeafe',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
        fontSize: '0.9rem',
        minWidth: '80px',
        border: 'none'
    };

    return (
        <div className={`d-flex align-items-center position-relative conference-dropdown-container ${className}`}>
            {showLabel && (
                <label className="me-2 fw-bold text-dark" style={{ fontSize: '1.3rem' }}>
                    {label}
                </label>
            )}
            <button 
                className="btn dropdown-toggle" 
                onClick={() => setConferenceDropdownOpen(!conferenceDropdownOpen)}
                style={{
                    ...defaultButtonStyle,
                    ...buttonStyle
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#bfdbfe';
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.color = '#1e3a8a';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#dbeafe';
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.color = '#1e40af';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                }}
            >
                {currentYear}
            </button>
            
            {conferenceDropdownOpen && (
                <div 
                    className="dropdown-menu show position-absolute"
                    style={getDropdownMenuStyle(true)}
                >
                    {availableYears.map((year: string) => (
                        <button
                            key={year}
                            className={`dropdown-item ${currentYear === year ? 'active' : ''}`}
                            onClick={() => handleYearSelect(year)}
                            style={currentYear === year ? adminStyles.dropdown.itemActive : adminStyles.dropdown.item}
                            onMouseEnter={(e) => {
                                if (currentYear !== year) {
                                    Object.assign(e.currentTarget.style, adminStyles.dropdown.itemHover);
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentYear !== year) {
                                    Object.assign(e.currentTarget.style, adminStyles.dropdown.item);
                                }
                            }}
                        >
                            {year}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ConferenceDropdown; 