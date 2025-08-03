import React from 'react';

interface NavButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  bgColor: string;
}

const NavButton: React.FC<NavButtonProps> = ({ onClick, children, bgColor }) => (
  <button 
    className="btn btn-sm"
    style={{ 
      backgroundColor: bgColor,
      borderColor: '#ced4da',
      fontWeight: '500',
      borderWidth: '1px',
      transition: 'all 0.2s ease-in-out',
      borderRadius: '10px',
      color: 'white',
      fontSize: '0.875rem',
      padding: '0.375rem 0.75rem'
    }}
    onClick={onClick}
  >
    <i className="fas fa-exclamation-triangle me-2" style={{ color: '#6c757d' }}></i>
    {children}
  </button>
);

export default NavButton; 