import React, { useState, useCallback, useMemo } from 'react';
import * as home from '../home';
import { adminStyles, getTooltipArrowStyle } from '../styles/adminStyles';

interface PromptCheckboxProps {
    selectedPrompts: string[];
    onPromptChange: (prompts: string[]) => void;
    isLoading?: boolean;
    showTooltip?: boolean;
    tooltipPosition?: 'left' | 'right';
    className?: string;
    disabled?: boolean;
    maxSelections?: number;
}

const PromptCheckbox: React.FC<PromptCheckboxProps> = ({
    selectedPrompts,
    onPromptChange,
    isLoading = false,
    showTooltip = true,
    tooltipPosition = 'left',
    className = '',
    disabled = false,
    maxSelections = 3
}) => {
    const [tooltipVisible, setTooltipVisible] = useState<boolean>(false);
    const [tooltipCoords, setTooltipCoords] = useState<{x: number, y: number}>({x: 0, y: 0});
    const [tooltipContent, setTooltipContent] = useState<string>("");

    // Handle checkbox change
    const handleCheckboxChange = useCallback((prompt: string, checked: boolean) => {
        if (disabled || isLoading) return;

        let newSelectedPrompts: string[];
        
        if (checked) {
            // Add prompt if under max limit
            if (selectedPrompts.length < maxSelections) {
                newSelectedPrompts = [...selectedPrompts, prompt];
            } else {
                // Replace the last selected prompt
                newSelectedPrompts = [...selectedPrompts.slice(0, -1), prompt];
            }
        } else {
            // Remove prompt
            newSelectedPrompts = selectedPrompts.filter(p => p !== prompt);
        }
        
        onPromptChange(newSelectedPrompts);
    }, [selectedPrompts, onPromptChange, disabled, isLoading, maxSelections]);

    // Handle tooltip
    const handleMouseEnter = useCallback((event: React.MouseEvent, prompt: string) => {
        if (!showTooltip || disabled || isLoading) return;
        
        const rect = event.currentTarget.getBoundingClientRect();
        setTooltipCoords({
            x: tooltipPosition === 'left' ? rect.left - 10 : rect.right + 10,
            y: rect.top + rect.height / 2
        });
        setTooltipContent(prompt);
        setTooltipVisible(true);
    }, [showTooltip, tooltipPosition, disabled, isLoading]);

    const handleMouseLeave = useCallback(() => {
        setTooltipVisible(false);
    }, []);

    // Memoize checkbox items to avoid unnecessary re-renders
    const checkboxItems = useMemo(() => {
        return home.PROMPT_CANDIDATES.map((prompt, index) => {
            const isSelected = selectedPrompts.includes(prompt);
            const isDisabled = disabled || isLoading || (!isSelected && selectedPrompts.length >= maxSelections);
            
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
                    onMouseEnter={(e) => handleMouseEnter(e, prompt)}
                    onMouseLeave={handleMouseLeave}
                >
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`prompt-${index}`}
                        checked={isSelected}
                        onChange={(e) => handleCheckboxChange(prompt, e.target.checked)}
                        disabled={isDisabled}
                        style={{
                            marginRight: '8px',
                            cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }}
                    />
                    <label
                        className={`form-check-label ${isSelected ? 'fw-bold text-primary' : 'text-dark'}`}
                        htmlFor={`prompt-${index}`}
                        style={{
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            lineHeight: '1.4'
                        }}
                    >
                        {index + 1}
                    </label>
                </div>
            );
        });
    }, [selectedPrompts, disabled, isLoading, maxSelections, handleCheckboxChange, handleMouseEnter, handleMouseLeave]);

    return (
        <div className={`position-relative ${className}`}>
            <div className="card border-0 shadow-sm">
                <div className="card-header border-0 py-2" style={{
                    ...adminStyles.table.header,
                    fontSize: '0.9rem',
                    padding: '8px 16px'
                }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span>Prompts </span>
                        {isLoading && (
                            <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="card-body p-3" style={{
                    maxHeight: '300px',
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
                        Prompt Preview:
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

export default PromptCheckbox; 