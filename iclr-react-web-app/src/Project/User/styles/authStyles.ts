// Authentication component styles organized by sections

export const authStyles = {
  // Main container styles
  container: {
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },

  // Card styles
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
    padding: '40px',
    minWidth: '400px',
    maxWidth: '500px',
    width: '100%',
    border: '1px solid rgba(255,255,255,0.2)'
  },

  // Header styles
  header: {
    title: {
      color: '#1f2937',
      fontWeight: '700',
      fontSize: '2rem',
      textAlign: 'center' as const,
      marginBottom: '30px'
    },
    subtitle: {
      color: '#6b7280',
      fontSize: '1rem',
      textAlign: 'center' as const,
      marginBottom: '30px'
    }
  },

  // Form styles
  form: {
    group: {
      marginBottom: '20px'
    },
    label: {
      color: '#374151',
      fontWeight: '600',
      fontSize: '0.9rem',
      marginBottom: '8px',
      display: 'block'
    },
    input: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    inputFocused: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    },
    inputBlurred: {
      borderColor: '#e5e7eb'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      transition: 'all 0.3s ease',
      outline: 'none',
      cursor: 'pointer'
    },
    selectFocused: {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
    }
  },

  // Button styles
  button: {
    primary: {
      width: '100%',
      padding: '14px 20px',
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginBottom: '15px'
    },
    primaryHover: {
      backgroundColor: '#2563eb',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
    },
    secondary: {
      width: '100%',
      padding: '14px 20px',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textDecoration: 'none',
      display: 'block',
      textAlign: 'center' as const
    },
    secondaryHover: {
      backgroundColor: '#e5e7eb',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
    }
  },

  // Alert styles
  alert: {
    error: {
      backgroundColor: '#fee2e2',
      color: '#991b1b',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px',
      fontSize: '0.9rem',
      fontWeight: '500'
    },
    warning: {
      backgroundColor: '#fef3c7',
      color: '#92400e',
      border: '1px solid #fed7aa',
      borderRadius: '8px',
      padding: '12px 16px',
      marginBottom: '20px',
      fontSize: '0.9rem',
      fontWeight: '500'
    }
  },

  // Role selection styles
  roleSection: {
    container: {
      marginBottom: '20px'
    },
    label: {
      color: '#374151',
      fontWeight: '600',
      fontSize: '0.9rem',
      marginBottom: '8px',
      display: 'block'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      transition: 'all 0.3s ease',
      outline: 'none',
      cursor: 'pointer'
    }
  },

  // Payment section styles
  paymentSection: {
    container: {
      marginTop: '15px',
      padding: '15px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    label: {
      color: '#374151',
      fontWeight: '600',
      fontSize: '0.9rem',
      marginBottom: '8px',
      display: 'block'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      fontSize: '1rem',
      backgroundColor: 'transparent',
      transition: 'all 0.3s ease',
      outline: 'none',
      cursor: 'pointer'
    }
  },

  // Admin code section styles
  adminSection: {
    container: {
      marginTop: '15px',
      padding: '15px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },
    label: {
      color: '#374151',
      fontWeight: '600',
      fontSize: '0.9rem',
      marginBottom: '8px',
      display: 'block'
    }
  },

  // Link styles
  link: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  },
  linkHover: {
    color: '#2563eb',
    textDecoration: 'underline'
  }
};

// Helper function to get button hover styles
export const getButtonHoverStyle = (isPrimary: boolean) => {
  return isPrimary ? authStyles.button.primaryHover : authStyles.button.secondaryHover;
}; 