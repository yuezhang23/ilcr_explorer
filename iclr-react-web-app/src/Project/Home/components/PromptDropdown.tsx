import React, { useState, useCallback, useMemo } from 'react';
import * as home from '../home';
import { adminStyles, getDropdownMenuStyle, getTooltipArrowStyle } from '../styles/adminStyles';

interface PromptDropdownProps {
    currentPrompt: string;
    onPromptChange: (prompt: string) => void;
    isLoading?: boolean;
    showTooltip?: boolean;
    tooltipPosition?: 'left' | 'right';
    className?: string;
    buttonStyle?: React.CSSProperties;
    disabled?: boolean;
}

const PromptDropdown: React.FC<PromptDropdownProps> = ({
    currentPrompt,
    onPromptChange,
    isLoading = false,
    showTooltip = true,
    tooltipPosition = 'left',
    className = '',
    buttonStyle = {},
    disabled = false
}) => {
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    const [dropdownTooltipVisible, setDropdownTooltipVisible] = useState<boolean>(false);
    const [dropdownTooltipPosition, setDropdownTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
    const [dropdownTooltipContent, setDropdownTooltipContent] = useState<string>("");
    const [buttonTooltipVisible, setButtonTooltipVisible] = useState<boolean>(false);
    const [buttonTooltipPosition, setButtonTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0});

    // Memoize prompt index to avoid recalculating on every render
    const currentPromptIndex = useMemo(() => {
        return home.PROMPT_CANDIDATES.findIndex(p => p === currentPrompt) + 1;
    }, [currentPrompt]);

    // Add click outside handler for dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (dropdownOpen && !target.closest('.dropdown-container') && !target.closest('.prompt-dropdown-menu')) {
                setDropdownOpen(false);
                setDropdownTooltipVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    // Tooltip handlers for dropdown options
    const handleDropdownOptionMouseEnter = useCallback((event: React.MouseEvent, prompt: string) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownTooltipPosition({
            x: tooltipPosition === 'left' ? rect.left - 10 : rect.right + 10,
            y: rect.top + rect.height / 2
        });
        setDropdownTooltipContent(prompt);
        setDropdownTooltipVisible(true);
    }, [tooltipPosition]);

    const handleDropdownOptionMouseLeave = useCallback(() => {
        setDropdownTooltipVisible(false);
    }, []);

    // Tooltip handlers for button
    const handleButtonMouseEnter = useCallback((event: React.MouseEvent) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setButtonTooltipPosition({
            x: tooltipPosition === 'left' ? rect.left - 10 : rect.right + 10,
            y: rect.top + rect.height / 2
        });
        setButtonTooltipVisible(true);
    }, [tooltipPosition]);

    const handleButtonMouseLeave = useCallback(() => {
        setButtonTooltipVisible(false);
    }, []);

    const handlePromptSelect = useCallback((prompt: string) => {
        onPromptChange(prompt);
        setDropdownOpen(false);
        setDropdownTooltipVisible(false);
    }, [onPromptChange]);

    return (
        <div className={`position-relative dropdown-container ${className}`}>
            <button 
                className="btn btn-sm dropdown-toggle" 
                onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                }}
                disabled={disabled || isLoading}
                style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    color: '#495057',
                    transition: 'all 0.2s ease',
                    ...(isLoading && { opacity: 0.6 }),
                    ...buttonStyle
                }}
                onMouseEnter={(e) => {
                    if (!isLoading && !disabled) {
                        e.currentTarget.style.backgroundColor = '#e9ecef';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        handleButtonMouseEnter(e);
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isLoading && !disabled) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                        e.currentTarget.style.transform = 'translateY(0)';
                        handleButtonMouseLeave();
                    }
                }}
            >
                {isLoading ? (
                    <>
                        <div className="spinner-border spinner-border-sm me-1" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        Loading...
                    </>
                ) : (
                    `Prompt ${currentPromptIndex}`
                )}
            </button>
            
            {dropdownOpen && (
                <div 
                    className="dropdown-menu show position-absolute prompt-dropdown-menu"
                    style={getDropdownMenuStyle(true)}
                >
                    {home.PROMPT_CANDIDATES.map((prompt, index) => (
                        <button
                            key={index}
                            className={`dropdown-item ${currentPrompt === prompt ? 'active' : ''}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePromptSelect(prompt);
                            }}
                            onMouseEnter={(e) => {
                                handleDropdownOptionMouseEnter(e, prompt);
                                if (currentPrompt !== prompt) {
                                    Object.assign(e.currentTarget.style, adminStyles.dropdown.itemHover);
                                }
                            }}
                            onMouseLeave={(e) => {
                                handleDropdownOptionMouseLeave();
                                if (currentPrompt !== prompt) {
                                    Object.assign(e.currentTarget.style, adminStyles.dropdown.item);
                                }
                            }}
                            style={currentPrompt === prompt ? adminStyles.dropdown.itemActive : adminStyles.dropdown.item}
                        >
                            Prompt {index + 1}
                        </button>
                    ))}
                </div>
            )}

            {/* Tooltip for dropdown options */}
            {showTooltip && dropdownTooltipVisible && (
                <div 
                    style={{
                        ...adminStyles.tooltip.dropdown,
                        left: dropdownTooltipPosition.x,
                        top: dropdownTooltipPosition.y,
                        transform: tooltipPosition === 'left' 
                            ? 'translateX(-100%) translateY(-50%)' 
                            : 'translateY(-50%)'
                    }}
                >
                    <div style={adminStyles.tooltip.title}>
                        Prompt Preview:
                    </div>
                    <div style={adminStyles.tooltip.content}>
                        {dropdownTooltipContent}
                    </div>
                    <div 
                        style={{
                            ...adminStyles.tooltip.arrow,
                            ...getTooltipArrowStyle(tooltipPosition)
                        }}
                    />
                </div>
            )}

            {/* Tooltip for button */}
            {showTooltip && buttonTooltipVisible && (
                <div 
                    style={{
                        ...adminStyles.tooltip.dropdown,
                        left: buttonTooltipPosition.x,
                        top: buttonTooltipPosition.y,
                        transform: tooltipPosition === 'left' 
                            ? 'translateX(-100%) translateY(-50%)' 
                            : 'translateY(-50%)'
                    }}
                >
                    <div style={adminStyles.tooltip.title}>
                        Current Prompt:
                    </div>
                    <div style={adminStyles.tooltip.content}>
                        {currentPrompt}
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

export default PromptDropdown; 