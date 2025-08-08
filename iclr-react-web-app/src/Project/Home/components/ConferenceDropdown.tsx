import React, { useState, useCallback } from 'react';
import { useYear } from '../../../contexts/YearContext';
import { adminStyles, getDropdownMenuStyle } from '../styles/adminStyles';

interface ConferenceDropdownProps {
    className?: string;
    buttonStyle?: React.CSSProperties;
    label?: string;
    showLabel?: boolean;
    onConferenceChange?: (conference: string) => void;
}

const ConferenceDropdown: React.FC<ConferenceDropdownProps> = ({
    className = '',
    buttonStyle = {},
    label = 'ICLR',
    showLabel = true,
    onConferenceChange
}) => {
    const [conferenceDropdownOpen, setConferenceDropdownOpen] = useState<boolean>(false);
    const [yearDropdownOpen, setYearDropdownOpen] = useState<boolean>(false);
    const [selectedConference, setSelectedConference] = useState<string>(label);
    const { currentYear, availableYears, setYear: setGlobalYear } = useYear();

    const availableConferences = ['ICLR', 'NeurIPS', 'ICML', 'ACL'];

    // Add click outside handler for dropdowns
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if ((conferenceDropdownOpen || yearDropdownOpen) && !target.closest('.conference-dropdown-container')) {
                setConferenceDropdownOpen(false);
                setYearDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [conferenceDropdownOpen, yearDropdownOpen]);

    const handleYearSelect = useCallback(async (year: string) => {
        const success = await setGlobalYear(year);
        if (success) {
            setYearDropdownOpen(false);
        }
    }, [setGlobalYear]);

    const handleConferenceSelect = useCallback((conference: string) => {
        setSelectedConference(conference);
        setConferenceDropdownOpen(false);
        if (onConferenceChange) {
            onConferenceChange(conference);
        }
    }, [onConferenceChange]);

    const defaultButtonStyle = {
        borderRadius: '8px',
        padding: '6px 12px',
        color: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'transparent',
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
        fontSize: '0.95rem',
        minWidth: '100px',
        border: 'none'
    };

    const conferenceButtonStyle = {
        ...defaultButtonStyle,
        backgroundColor: 'transparent',
        color: 'rgba(255, 255, 255, 0.8)',
        minWidth: '100px'
    };

    return (
        <div className={`d-flex align-items-center position-relative conference-dropdown-container ${className}`}>
            {showLabel && (
                <div className="me-3 position-relative">
                    <button 
                        className="btn dropdown-toggle" 
                        onClick={() => setConferenceDropdownOpen(!conferenceDropdownOpen)}
                        style={conferenceButtonStyle}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        {selectedConference}
                    </button>
                    
                    {conferenceDropdownOpen && (
                        <div 
                            className="dropdown-menu show position-absolute"
                            style={{
                                ...getDropdownMenuStyle(true),
                                top: '100%',
                                left: '0',
                                zIndex: 1001,
                                width: '100px',
                                minWidth: '100px'
                            }}
                        >
                            {availableConferences.map((conference: string) => (
                                <button
                                    key={conference}
                                    className={`dropdown-item ${selectedConference === conference ? 'active' : ''}`}
                                    onClick={() => handleConferenceSelect(conference)}
                                    style={selectedConference === conference ? adminStyles.dropdown.itemActive : adminStyles.dropdown.item}
                                    onMouseEnter={(e) => {
                                        if (selectedConference !== conference) {
                                            Object.assign(e.currentTarget.style, adminStyles.dropdown.itemHover);
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (selectedConference !== conference) {
                                            Object.assign(e.currentTarget.style, adminStyles.dropdown.item);
                                        }
                                    }}
                                >
                                    {conference}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
            <div className="position-relative">
                <button 
                    className="btn dropdown-toggle" 
                    onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                    style={{
                        ...defaultButtonStyle,
                        ...buttonStyle
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    {currentYear}
                </button>
                
                {yearDropdownOpen && (
                    <div 
                        className="dropdown-menu show position-absolute"
                        style={{
                            ...getDropdownMenuStyle(true),
                            top: '100%',
                            left: '0',
                            zIndex: 1000,
                            width: '100px',
                            minWidth: '100px'
                        }}
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
            
        </div>
    );
};

export default ConferenceDropdown; 