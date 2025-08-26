import { CSSProperties } from 'react';

// Base dropdown styles
export const baseDropdownStyles: CSSProperties = {
  position: 'relative',
  zIndex: 1000,
};

// Dropdown button styles
export const dropdownButtonStyles: CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '20px',
  fontSize: '0.9rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  minHeight: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

// Dropdown button hover styles
export const dropdownButtonHoverStyles: CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderColor: 'rgba(255, 255, 255, 0.5)',
  transform: 'translateY(-1px)',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

// Dropdown menu styles
export const dropdownMenuStyles: CSSProperties = {
  position: 'absolute',
  top: '100%',
  left: '0',
  right: '0',
  backgroundColor: 'white',
  border: '1px solid #e9ecef',
  borderRadius: '12px',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
  marginTop: '8px',
  padding: '8px 0',
  maxHeight: '300px',
  overflowY: 'auto',
  zIndex: 1001,
  minWidth: '200px',
};

// Dropdown item styles
export const dropdownItemStyles: CSSProperties = {
  padding: '12px 16px',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: 'none',
  backgroundColor: 'transparent',
  width: '100%',
  textAlign: 'left',
  fontSize: '0.9rem',
  color: '#495057',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '44px', // Touch-friendly height
};

// Dropdown item hover styles
export const dropdownItemHoverStyles: CSSProperties = {
  backgroundColor: '#f8f9fa',
  color: '#667eea',
  transform: 'translateX(4px)',
};

// Dropdown item active styles
export const dropdownItemActiveStyles: CSSProperties = {
  backgroundColor: '#667eea',
  color: 'white',
};

// Mobile-first responsive styles
export const mobileDropdownStyles = {
  button: {
    ...dropdownButtonStyles,
    padding: '12px 16px',
    fontSize: '1rem',
    minHeight: '44px',
    borderRadius: '8px',
    width: '100%',
    justifyContent: 'center',
  },
  menu: {
    ...dropdownMenuStyles,
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90vw',
    maxWidth: '400px',
    maxHeight: '70vh',
    borderRadius: '12px',
    marginTop: '0',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  },
  item: {
    ...dropdownItemStyles,
    padding: '16px 20px',
    fontSize: '1rem',
    minHeight: '48px',
    borderBottom: '1px solid #f1f3f4',
  },
};

// Tablet styles
export const tabletDropdownStyles = {
  button: {
    ...dropdownButtonStyles,
    padding: '10px 18px',
    fontSize: '0.95rem',
    minHeight: '40px',
  },
  menu: {
    ...dropdownMenuStyles,
    minWidth: '180px',
  },
  item: {
    ...dropdownItemStyles,
    padding: '14px 18px',
    fontSize: '0.95rem',
    minHeight: '42px',
  },
};

// Desktop styles
export const desktopDropdownStyles = {
  button: {
    ...dropdownButtonStyles,
    padding: '8px 16px',
    fontSize: '0.9rem',
    minHeight: '36px',
  },
  menu: {
    ...dropdownMenuStyles,
    minWidth: '200px',
  },
  item: {
    ...dropdownItemStyles,
    padding: '12px 16px',
    fontSize: '0.9rem',
    minHeight: '40px',
  },
};

// Responsive breakpoint utilities
export const responsiveDropdownStyles = {
  // Mobile (default)
  mobile: mobileDropdownStyles,
  
  // Tablet
  tablet: {
    '@media (min-width: 768px)': tabletDropdownStyles,
  },
  
  // Desktop
  desktop: {
    '@media (min-width: 1024px)': desktopDropdownStyles,
  },
  
  // Large desktop
  large: {
    '@media (min-width: 1200px)': {
      button: {
        ...desktopDropdownStyles.button,
        padding: '10px 20px',
        fontSize: '1rem',
      },
      menu: {
        ...desktopDropdownStyles.menu,
        minWidth: '220px',
      },
    },
  },
};

// Touch-friendly improvements
export const touchDropdownStyles = {
  button: {
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  },
  item: {
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  },
};

// Accessibility improvements
export const accessibleDropdownStyles = {
  button: {
    'aria-haspopup': 'true',
    'aria-expanded': 'false',
    role: 'button',
    tabIndex: 0,
  },
  menu: {
    role: 'listbox',
    'aria-label': 'Dropdown options',
  },
  item: {
    role: 'option',
    tabIndex: -1,
  },
};

// Dark mode support
export const darkModeDropdownStyles = {
  button: {
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
    },
  },
  menu: {
    '@media (prefers-color-scheme: dark)': {
      backgroundColor: '#2d2d2d',
      borderColor: '#444',
      color: '#e9ecef',
    },
  },
  item: {
    '@media (prefers-color-scheme: dark)': {
      color: '#e9ecef',
      '&:hover': {
        backgroundColor: '#3d3d3d',
        color: '#667eea',
      },
    },
  },
};

// High contrast mode support
export const highContrastDropdownStyles = {
  button: {
    '@media (prefers-contrast: high)': {
      border: '2px solid #ffffff',
      color: '#ffffff',
    },
  },
  menu: {
    '@media (prefers-contrast: high)': {
      border: '2px solid #000000',
    },
  },
  item: {
    '@media (prefers-contrast: high)': {
      borderBottom: '1px solid #000000',
    },
  },
};

// Reduced motion support
export const reducedMotionDropdownStyles = {
  button: {
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '&:hover': {
        transform: 'none',
      },
    },
  },
  item: {
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
      '&:hover': {
        transform: 'none',
      },
    },
  },
};

// Export all styles for easy access
export const allDropdownStyles = {
  base: baseDropdownStyles,
  button: dropdownButtonStyles,
  buttonHover: dropdownButtonHoverStyles,
  menu: dropdownMenuStyles,
  item: dropdownItemStyles,
  itemHover: dropdownItemHoverStyles,
  itemActive: dropdownItemActiveStyles,
  mobile: mobileDropdownStyles,
  tablet: tabletDropdownStyles,
  desktop: desktopDropdownStyles,
  responsive: responsiveDropdownStyles,
  touch: touchDropdownStyles,
  accessible: accessibleDropdownStyles,
  darkMode: darkModeDropdownStyles,
  highContrast: highContrastDropdownStyles,
  reducedMotion: reducedMotionDropdownStyles,
};

