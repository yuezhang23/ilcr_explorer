import React, { useState, useCallback, useEffect } from 'react';
import * as home from '../home';
import { dropdownStyles } from './dropdownStyles';
import { adminStyles, getDropdownMenuStyle } from '../styles/adminStyles';

interface PromptDropdownProps {
  selectedPrompt: string;
  onPromptChange: (prompt: string) => void;
  isLoading?: boolean;
  className?: string;
  disabled?: boolean;
}

const PromptDropdown: React.FC<PromptDropdownProps> = ({
  selectedPrompt,
  onPromptChange,
  isLoading = false,
  className = '',
  disabled = false
}) => {
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  // Helper function to get prompt type
  const getPromptType = (prompt: string) => {
    const promptTypeObj = home.PROMPT_TYPES.find(pt => pt.prompt === prompt);
    return promptTypeObj ? promptTypeObj.type : -1;
  };

  // Helper function to get prompt display name
  const getPromptDisplayName = (prompt: string) => {
    const index = home.PROMPT_CANDIDATES.indexOf(prompt);
    return index !== -1 ? `Prompt ${index + 1}` : 'Unknown';
  };

  // Helper function to get prompt color based on type
  const getPromptColor = (prompt: string) => {
    const promptType = getPromptType(prompt);
    switch (promptType) {
      case 0:
        return 'rgba(31, 117, 7, 0.94)'; // Green for type 0
      case 1:
        return 'rgba(16, 32, 211, 0.81)'; // Blue for type 1
      default:
        return 'rgba(17, 16, 16, 0.69)'; // Black for type -1
    }
  };

  // Add click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (dropdownOpen && !target.closest('.prompt-dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handlePromptSelect = useCallback((prompt: string) => {
    onPromptChange(prompt);
    setDropdownOpen(false);
  }, [onPromptChange]);

  const buttonStyle = {
    ...dropdownStyles,
    width: '110px',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative' as const
  };

  return (
    <div className={`position-relative prompt-dropdown-container ${className}`}>
      <button
        className="btn dropdown-toggle"
        onClick={() => !disabled && !isLoading && setDropdownOpen(!dropdownOpen)}
        style={buttonStyle}
        disabled={disabled || isLoading}
      >
        <span style={{ color: getPromptColor(selectedPrompt), fontWeight: '700' }}>
          {getPromptDisplayName(selectedPrompt)}
        </span>
      </button>
      
      {dropdownOpen && (
        <div 
          className="dropdown-menu show position-absolute"
          style={{
            ...getDropdownMenuStyle(true),
            top: '100%',
            left: '0',
            width: '120px',
            minWidth: '120px'
          }}
        >
          {home.PROMPT_CANDIDATES.map((prompt, index) => {
            const isSelected = selectedPrompt === prompt;
            const promptColor = getPromptColor(prompt);
            
            return (
              <button
                key={index}
                className={`dropdown-item ${isSelected ? 'active' : ''}`}
                onClick={() => handlePromptSelect(prompt)}
                style={{
                  ...(isSelected ? adminStyles.dropdown.itemActive : adminStyles.dropdown.item),
                  color: promptColor,
                  fontWeight: isSelected ? '700' : '400'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    Object.assign(e.currentTarget.style, {
                      ...adminStyles.dropdown.itemHover,
                      color: promptColor
                    });
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    Object.assign(e.currentTarget.style, {
                      ...adminStyles.dropdown.item,
                      color: promptColor
                    });
                  }
                }}
              >
                Prompt {index + 1}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PromptDropdown; 