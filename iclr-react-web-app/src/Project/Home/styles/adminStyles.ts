// Admin component styles organized by sections

export const adminStyles = {
  // Main container styles
  container: {
    backgroundColor: '#f8fafc',
    minHeight: 'calc(100vh - 80px)', // Account for Nav height
    width: '100%',
    maxWidth: '100%',
    paddingTop: '10px', // Add some spacing from Nav
  },

  // Pagination styles
  pagination: {
    button: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      color: 'black',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    },
    buttonDisabled: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      color: 'black',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      transition: 'all 0.3s ease',
      fontWeight: '500'
    },
    pageInfo: {
      minWidth: '200px'
    },
    pageInput: {
      width: '50px',
      textAlign: 'center' as const,
      margin: '0 6px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      fontWeight: 600
    },
    totalRecords: {
      fontSize: '0.8rem',
      opacity: 0.8
    }
  },

  // Search styles
  search: {
    icon: {
      left: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#6b7280',
      zIndex: 1
    },
    input: {
      minWidth: '350px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      border: 'none',
      paddingLeft: '45px',
      paddingRight: '20px',
      paddingTop: '12px',
      paddingBottom: '12px',
      fontSize: '0.95rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease'
    },
    inputFocused: {
      backgroundColor: '#ffffff',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      transform: 'translateY(-2px)'
    },
    inputBlurred: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      transform: 'translateY(0)'
    }
  },

  // Table styles
  table: {
    card: {
      borderRadius: '16px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column' as const,
      // padding: '8px 8px'
    },
    header: {
      background: 'linear-gradient(135deg,rgb(141, 141, 220) 0%,rgb(134, 97, 171) 100%)',
      color: 'white',
      fontWeight: '600',
      fontSize: '1.0rem',
      top: 0,
      zIndex: 10, // Lower than container zIndex
      position: 'sticky' as const,
      textAlign: 'center' as const,
    },
    headerRow: {
      fontSize: '0.85rem',
      height: '30px'
    },
    sortButton: {
      fontSize: '0.95rem',
      transition: 'all 0.3s ease',
      borderRadius: '8px',
    },
    body: {
      overflowY: 'auto' as const,
      flex: 1,
      minHeight: 0,
    }
  },

  // Row styles
  row: {
    base: {
      minHeight: '160px',
      height: '180px',
      transition: 'all 0.3s ease',
      padding: '10px',
      backgroundColor: '#ffffff',
    },
    expanded: {
      minHeight: '150px',
      height: 'auto',
      transition: 'all 0.3s ease',
      padding: '20px',
      backgroundColor: '#ffffff'
    },
    even: {
      backgroundColor: '#ffffff'
    },
    odd: {
      backgroundColor: '#f9fafb'
    },
    hover: {
      backgroundColor: '#f3f4f6',
      transform: 'translateX(4px)'
    }
  },

  // Badge styles
  badge: {
    conference: {
      backgroundColor: '#e0e7ff',
      color: '#3730a3',
      fontWeight: '600',
      fontSize: '0.8rem'
    },
    decision: {
      fontWeight: '600',
      fontSize: '0.8rem'
    }
  },

  // Rating styles
  rating: {
    high: {
      color: '#059669',
      fontSize: '1.1rem'
    },
    medium: {
      color: '#d97706',
      fontSize: '1.1rem'
    },
    low: {
      color: '#dc2626',
      fontSize: '1.1rem'
    }
  },

  // Title styles
  title: {
    link: {
      color: '#1f2937',
      fontSize: '1rem',
      lineHeight: '1.4'
    },
    linkHover: {
      color: '#4f46e5'
    },
    text: {
      color: '#1f2937'
    }
  },

  // Button styles
  button: {
    abstract: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      border: 'none',
      fontSize: '0.8rem',
      padding: '6px 16px',
      transition: 'all 0.3s ease'
    },
    abstractExpanded: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      fontSize: '0.8rem',
      padding: '6px 16px',
      transition: 'all 0.3s ease'
    },
    abstractHover: {
      backgroundColor: '#e5e7eb'
    },
    authors: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280',
      border: 'none',
      fontSize: '0.75rem',
      padding: '4px 12px',
      transition: 'all 0.3s ease'
    },
    authorsExpanded: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      fontSize: '0.75rem',
      padding: '4px 12px',
      transition: 'all 0.3s ease'
    },
    authorsHover: {
      backgroundColor: '#e5e7eb'
    },
    prediction: {
      fontWeight: '600',
      fontSize: '0.8rem'
    }
  },

  // Abstract styles
  abstract: {
    container: {
      backgroundColor: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      whiteSpace: 'normal' as const,
      wordBreak: 'break-word' as const,
      fontSize: '0.9rem',
      lineHeight: '1.6',
      maxHeight: '200px',
      overflowY: 'auto' as const,
      color: '#4b5563'
    }
  },

  // Authors styles
  authors: {
    list: {
      maxHeight: '90px',
      overflow: 'hidden',
      position: 'relative' as const
    },
    listExpanded: {
      maxHeight: 'none',
      overflow: 'visible',
      position: 'relative' as const
    },
    item: {
      fontSize: '0.85rem',
      lineHeight: '1.3',
      marginBottom: '3px',
      color: '#374151'
    }
  },

  // Individual rating styles
  individualRating: {
    high: {
      fontSize: '0.8rem',
      color: '#059669',
      fontWeight: '500'
    },
    medium: {
      fontSize: '0.8rem',
      color: '#d97706',
      fontWeight: '500'
    },
    low: {
      fontSize: '0.8rem',
      color: '#dc2626',
      fontWeight: '500'
    }
  },

  // Confidence styles
  confidence: {
    high: {
      color: '#059669',
      fontSize: '1rem'
    },
    medium: {
      color: '#d97706',
      fontSize: '1rem'
    },
    low: {
      color: '#dc2626',
      fontSize: '1rem'
    }
  },

  // Decision badge colors
  decisionColors: {
    accept: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    reject: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    other: {
      backgroundColor: '#fef3c7',
      color: '#92400e'
    }
  },

  // Prediction styles
  prediction: {
    container: {
      fontSize: '0.9rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%'
    }
  },

  // Prediction button colors
  predictionColors: {
    accept: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    reject: {
      backgroundColor: '#fee2e2',
      color: '#991b1b'
    },
    other: {
      backgroundColor: '#e0e7ff',
      color: '#3730a3'
    },
    none: {
      backgroundColor: '#f3f4f6',
      color: '#6b7280'
    }
  },

  // Empty state styles
  emptyState: {
    container: {
      color: '#6b7280'
    },
    icon: {
      fontSize: '3rem',
      marginBottom: '1rem',
      opacity: 0.5
    }
  },

  // Loading state styles
  loadingState: {
    container: {
      color: '#6b7280',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '1rem'
    }
  },

  // Modal styles
  modal: {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      zIndex: 999999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(8px)'
    },
    container: {
      background: 'white',
      borderRadius: '16px',
      padding: '15px 30px',
      minWidth: '600px',
      maxWidth: '80vw',
      maxHeight: '90vh',
      boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
      position: 'relative' as const,
      zIndex: 1000000,
      border: '1px solid rgba(255,255,255,0.2)'
    },
    title: {
      color: '#1f2937',
      fontWeight: '600'
    },
    textarea: {
      resize: 'vertical' as const,
      fontSize: '1rem',
      border: '2px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      backgroundColor: 'transparent',
      position: 'relative' as const,
      zIndex: 2
    },
    placeholder: {
      position: 'absolute' as const,
      top: '16px',
      left: '16px',
      right: '16px',
      bottom: '16px',
      pointerEvents: 'none' as const,
      zIndex: 1,
      fontSize: '1rem',
      lineHeight: '1.5',
      color: '#9ca3af',
      whiteSpace: 'pre-wrap' as const
    },
    placeholderText: {
      color: '#d1d5db',
      fontStyle: 'italic'
    },
    button: {
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'all 0.3s ease'
    },
    submitButton: {
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      backgroundColor: '#3b82f6',
      border: 'none'
    },
    link: {
      color: 'blue'
    },
    textareaContainer: {
      position: 'relative' as const
    },
    confirmSubmitButton: {
      borderRadius: '8px',
      fontWeight: '500',
      transition: 'all 0.3s ease',
      backgroundColor: '#059669',
      border: 'none'
    }
  },

  // Analytics button style with texture
  analyticsButton: {
    borderRadius: '8px',
    padding: '6px 12px',
    color: '#1e40af',
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)',
    backgroundImage: `
      linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%),
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.15) 0%, transparent 50%)
    `,
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
    fontSize: '1.0rem',
    minWidth: '80px',
    textDecoration: 'none',
    position: 'relative' as const,
    overflow: 'hidden'
  },
  analyticsButtonHover: {
    background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)',
    backgroundImage: `
      linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%),
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.25) 0%, transparent 50%)
    `,
    color: '#1e3a8a',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
  },
  analyticsButtonActive: {
    background: 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)',
    backgroundImage: `
      linear-gradient(135deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%),
      radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(147, 197, 253, 0.25) 0%, transparent 50%)
    `,
    color: '#1e3a8a',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 8px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
  },

  // Enhanced Dropdown styles (common between admin.tsx and rating.tsx)
  dropdown: {
    button: {
      fontSize: '0.8rem',
      padding: '6px 10px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      backgroundColor: '#f9fafb',
      minWidth: '70px',
      fontWeight: '400',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    buttonDisabled: {
      fontSize: '0.8rem',
      padding: '6px 10px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      backgroundColor: '#f3f4f6',
      minWidth: '70px',
      fontWeight: '400',
      transition: 'all 0.3s ease',
      cursor: 'not-allowed',
      opacity: 0.6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    menu: {
      top: '100%',
      left: '0',
      zIndex: 1000,
      minWidth: '150px',
      maxWidth: '150px',
      width: '150px',
      backgroundColor: '#fff',
      border: '1px solid #dee2e6',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      padding: '8px 0',
      overflow: 'hidden',
      position: 'absolute' as const,
      marginTop: '4px'
    },
    menuExpanded: {
      top: '100%',
      left: '0',
      zIndex: 9999,
      minWidth: '150px',
      maxWidth: '150px',
      width: '150px',
      backgroundColor: '#fff',
      border: '1px solid #212529',
      borderRadius: '12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      padding: '8px 0',
      overflow: 'visible',
      position: 'absolute' as const,
      marginTop: '4px',
      display: 'block',
      maxHeight: 'none',
      height: 'auto'
    },
    item: {
      fontSize: '0.9rem',
      fontWeight: '500',
      padding: '8px 16px',
      border: 'none',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      textAlign: 'left' as const,
      whiteSpace: 'normal' as const,
      wordWrap: 'break-word' as const,
      transition: 'all 0.2s ease',
      width: '100%'
    },
    itemActive: {
      backgroundColor: 'transparent',
      fontSize: '0.9rem',
      fontWeight: '600',
      padding: '8px 16px',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      textAlign: 'left' as const,
      whiteSpace: 'normal' as const,
      wordWrap: 'break-word' as const,
      transition: 'all 0.2s ease',
      width: '100%'
    },
    itemHover: {
      backgroundColor: '#f8f9fa'
    },
    container: {
      position: 'relative' as const,
      width: '100%'
    }
  },

  // Enhanced Tooltip styles (common between admin.tsx and rating.tsx)
  tooltip: {
    dropdown: {
      position: 'fixed' as const,
      backgroundColor: '#333',
      color: 'white',
      padding: '16px 20px',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '500px',
      maxWidth: '600px',
      zIndex: 1001,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      border: '1px solid #555',
      whiteSpace: 'pre-wrap' as const,
      wordWrap: 'break-word' as const,
      overflowY: 'auto' as const
    },
    prediction: {
      position: 'fixed' as const,
      backgroundColor: '#333',
      color: 'white',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      minWidth: '300px',
      maxWidth: '400px',
      zIndex: 1000,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      border: '1px solid #555',
      whiteSpace: 'pre-wrap' as const,
      wordWrap: 'break-word' as const
    },
    title: {
      fontWeight: 'bold',
      marginBottom: '8px'
    },
    content: {
      fontSize: '13px',
      lineHeight: '1.4',
      textAlign: 'left' as const
    },
    arrow: {
      position: 'absolute' as const,
      width: 0,
      height: 0
    },
    arrowRight: {
      top: '50%',
      right: '-6px',
      transform: 'translateY(-50%)',
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderLeft: '6px solid #333'
    },
    arrowLeft: {
      top: '50%',
      left: '-6px',
      transform: 'translateY(-50%)',
      borderTop: '6px solid transparent',
      borderBottom: '6px solid transparent',
      borderRight: '6px solid #333'
    },
    arrowDown: {
      top: '100%',
      left: '50%',
      transform: 'translateX(-50%)',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: '6px solid #333'
    }
  },

  // Form control styles (common between admin.tsx and rating.tsx)
  form: {
    label: {
      fontSize: '0.9rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: '#374151'
    },
    select: {
      fontSize: '0.9rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      padding: '6px 12px',
      backgroundColor: '#fff',
      transition: 'all 0.2s ease'
    },
    switch: {
      cursor: 'pointer'
    },
    switchLabel: {
      fontSize: '0.8rem',
      fontWeight: '400',
      color: '#374151'
    }
  },

  // Layout styles (common between admin.tsx and rating.tsx)
  layout: {
    sidebar: {
      overflow: 'visible',
      width: '300px',
      minHeight: 'fit-content'
    },
    mainContent: {
      flexGrow: 1
    },
    flexContainer: {
      display: 'flex',
      gap: '1rem',
      margin: '0.5rem'
    },
    cardSpacing: {
      marginBottom: '1rem'
    }
  },

  // Loading spinner styles (common between admin.tsx and rating.tsx)
  spinner: {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '400px'
    },
    content: {
      textAlign: 'center' as const
    },
    text: {
      marginTop: '0.75rem',
      color: '#6b7280'
    }
  },

  // Info message styles
  infoMessage: {
    color: 'red',
    fontSize: '0.85em',
    fontStyle: 'italic',
    marginTop: '0.25rem'
  }
};

// Helper functions for dynamic styles
export const getRatingColor = (rating: number) => {
  if (rating >= 7) return adminStyles.rating.high;
  if (rating >= 5) return adminStyles.rating.medium;
  return adminStyles.rating.low;
};

export const getConfidenceColor = (confidence: number) => {
  if (confidence >= 0.8) return adminStyles.confidence.high;
  if (confidence >= 0.6) return adminStyles.confidence.medium;
  return adminStyles.confidence.low;
};

export const getDecisionColors = (decision: string) => {
  if (decision.includes('Accept')) return adminStyles.decisionColors.accept;
  if (decision === 'Reject') return adminStyles.decisionColors.reject;
  return adminStyles.decisionColors.other;
};

export const getPredictionColors = (prediction: string | null) => {
  if (!prediction) return adminStyles.predictionColors.none;
  
  const predStr = prediction.toString().toLowerCase();
  if (predStr.includes('accept') || predStr.includes('yes') || predStr.includes('positive')) {
    return adminStyles.predictionColors.accept;
  } else if (predStr.includes('reject') || predStr.includes('no') || predStr.includes('negative')) {
    return adminStyles.predictionColors.reject;
  } else {
    return adminStyles.predictionColors.other;
  }
};

export const getIndividualRatingColor = (rating: number) => {
  if (rating >= 7) return adminStyles.individualRating.high;
  if (rating >= 5) return adminStyles.individualRating.medium;
  return adminStyles.individualRating.low;
};

export const getRowBackground = (index: number, isExpanded: boolean) => {
  const baseStyle = isExpanded ? adminStyles.row.expanded : (index % 2 === 0 ? adminStyles.row.even : adminStyles.row.odd);
  return {
    ...adminStyles.row.base,
    ...baseStyle
  };
};

export const getPaginationButtonStyle = (isDisabled: boolean) => {
  return isDisabled ? adminStyles.pagination.buttonDisabled : adminStyles.pagination.button;
};

// New helper functions for common patterns
export const getDropdownButtonStyle = (isLoading: boolean) => {
  return isLoading ? adminStyles.dropdown.buttonDisabled : adminStyles.dropdown.button;
};

export const getDropdownMenuStyle = (isExpanded: boolean) => {
  return isExpanded ? adminStyles.dropdown.menuExpanded : adminStyles.dropdown.menu;
};

export const getTooltipArrowStyle = (position: 'left' | 'right' | 'down') => {
  switch (position) {
    case 'left':
      return adminStyles.tooltip.arrowLeft;
    case 'right':
      return adminStyles.tooltip.arrowRight;
    case 'down':
      return adminStyles.tooltip.arrowDown;
    default:
      return adminStyles.tooltip.arrowRight;
  }
};

// Helper function for dynamic header height
export const getHeaderStyle = (height?: string | number) => {
  const baseStyle = adminStyles.table.header;
  if (!height) return baseStyle;
  
  return {
    ...baseStyle,
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: typeof height === 'number' ? `${height}px` : height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
}; 