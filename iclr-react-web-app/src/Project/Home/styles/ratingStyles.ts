import { CSSProperties } from 'react';

// Main container styles
export const ratingStyles = {
    container: {
        padding: '0'
    } as CSSProperties,
    
    // Left side menu styles
    leftMenu: {
        overflow: 'visible',
        width: '350px',
        height: 'fit-content'
    } as CSSProperties,
    
    leftMenuHeader: {
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: '15px',
        borderTopRightRadius: '15px'
    } as CSSProperties,
    
    leftMenuBody: {
        overflow: 'visible'
    } as CSSProperties,
    
    // Form control styles
    formControlContainer: {
        position: 'relative',
        width: '100%'
    } as CSSProperties,
    
    formLabel: {
        fontSize: '0.9rem',
        fontWeight: '600'
    } as CSSProperties,
    
    promptInfo: {
        fontSize: '0.8rem'
    } as CSSProperties,
    
    // Main content area styles
    mainContent: {
        minWidth: 0
    } as CSSProperties,
    
    // Loading container styles
    loadingContainer: {
        height: '400px'
    } as CSSProperties,
    
    // Toggle button styles
    getToggleButtonStyle: (showPredictionErrors: boolean, isLoadingPredictions: boolean): CSSProperties => ({
        background: showPredictionErrors 
            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 16px',
        fontWeight: '600',
        fontSize: '0.85rem',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        cursor: isLoadingPredictions ? 'not-allowed' : 'pointer',
        opacity: isLoadingPredictions ? 0.6 : 1
    }),
    
    // Button hover effects
    getButtonHoverStyle: (isLoadingPredictions: boolean): CSSProperties => ({
        transform: isLoadingPredictions ? 'none' : 'translateY(-1px)',
        boxShadow: isLoadingPredictions ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
    }),
    
    getButtonLeaveStyle: (isLoadingPredictions: boolean): CSSProperties => ({
        transform: isLoadingPredictions ? 'none' : 'translateY(0)',
        boxShadow: isLoadingPredictions ? '0 2px 8px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.15)'
    })
}; 