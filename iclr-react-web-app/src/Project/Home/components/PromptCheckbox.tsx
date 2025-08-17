import React, { useState, useCallback, useMemo } from 'react';
import * as home from '../home';
import { adminStyles } from '../styles/adminStyles';

interface PromptCheckboxProps {
    selectedPrompt: string | null;
    onPromptChange: (prompt: string | null) => void;
    isLoading?: boolean;
    className?: string;
    disabled?: boolean;
}

const PromptCheckbox: React.FC<PromptCheckboxProps> = ({
    selectedPrompt,
    onPromptChange,
    isLoading = false,
    className = '',
    disabled = false
}) => {
    // Handle checkbox change
    const handleCheckboxChange = useCallback((prompt: string, checked: boolean) => {
        if (disabled || isLoading) return;

        if (checked) {
            onPromptChange(prompt);
        } else {
            onPromptChange(null);
        }
    }, [onPromptChange, disabled, isLoading]);

    // Memoize checkbox items to avoid unnecessary re-renders
    const checkboxItems = useMemo(() => {
        return home.PROMPT_CANDIDATES.map((prompt, index) => {
            const isSelected = selectedPrompt === prompt;
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
                        name="prompt-selection"
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
                        {index + 1} - {home.PROMPT_TYPES.find(p => p.prompt === prompt)?.type === 1 ? 'APO - Rebuttal' : home.PROMPT_TYPES.find(p => p.prompt === prompt)?.type === 0 ? 'APO - Non-Rebuttal' : 'Initial'}
                    </label>
                </div>
            );
        });
    }, [selectedPrompt, disabled, isLoading, handleCheckboxChange]);

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
        </div>
    );
};

export default PromptCheckbox; 