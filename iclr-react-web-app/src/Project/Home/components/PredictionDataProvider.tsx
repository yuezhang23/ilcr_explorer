import React, { useEffect, useCallback } from 'react';
import { usePredictionStats } from '../../hooks/usePredictionStats';

interface PredictionDataProviderProps {
  children: React.ReactNode;
  initialYear?: string;
}

/**
 * Centralized data provider for prediction stats
 * This component handles all data fetching and prevents duplicate API calls
 */
const PredictionDataProvider: React.FC<PredictionDataProviderProps> = ({ 
  children, 
  initialYear = '2024' 
}) => {
  const { 
    allPromptsMetrics, 
    isLoading, 
    error, 
    currentYear, 
    fetchAllData, 
    changeYear, 
    hasAllData,
    hasDataForYear 
  } = usePredictionStats();

  // Initialize data fetching when component mounts
  useEffect(() => {
    // Set initial year
    changeYear(initialYear);
    
    // Fetch all data once on mount if we don't have it
    if (!hasAllData()) {
      fetchAllData('all');
    }
  }, [changeYear, fetchAllData, hasAllData, initialYear]);

  // Handle year changes and fetch data if needed
  useEffect(() => {
    if (currentYear && !hasDataForYear(currentYear)) {
      fetchAllData(currentYear);
    }
  }, [currentYear, fetchAllData, hasDataForYear]);

  // Provide context value to children
  const contextValue = {
    allPromptsMetrics,
    isLoading,
    error,
    currentYear,
    hasDataForYear,
    hasAllData
  };

  return (
    <div className="prediction-data-provider">
      {children}
    </div>
  );
};

export default PredictionDataProvider;
