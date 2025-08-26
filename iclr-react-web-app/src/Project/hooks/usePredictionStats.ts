import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchPredictionStats, fetchAllPredictionStats, setCurrentYear, clearError } from '../Reducers/predictionStatsReducer';

export const usePredictionStats = () => {
  const dispatch = useDispatch<any>();
  const { allPromptsMetrics, isLoading, error, currentYear } = useSelector(
    (state: RootState) => state.predictionStatsReducer
  );

  const fetchData = useCallback((year: string) => {
    dispatch(fetchPredictionStats(year));
  }, [dispatch]);

  const fetchAllData = useCallback((year?: string) => {
    dispatch(fetchAllPredictionStats(year || 'all'));
  }, [dispatch]);

  const fetchDataForYear = useCallback((year: string) => {
    dispatch(fetchAllPredictionStats(year));
  }, [dispatch]);

  const changeYear = useCallback((year: string) => {
    dispatch(setCurrentYear(year));
  }, [dispatch]);

  const clearErrorState = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Get all available years from the data
  const getAvailableYears = useCallback(() => {
    if (!allPromptsMetrics || allPromptsMetrics.length === 0) return [];
    
    const years = new Set<string>();
    allPromptsMetrics.forEach(metric => {
      if (metric.year) {
        years.add(metric.year);
      }
    });
    
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending
  }, [allPromptsMetrics]);

  // Check if we have data for all available years
  const hasAllData = useCallback(() => {
    if (!allPromptsMetrics || allPromptsMetrics.length === 0) return false;
    
    // Check if we have data for multiple years (indicating comprehensive data)
    const availableYears = getAvailableYears();
    return availableYears.length > 1;
  }, [allPromptsMetrics, getAvailableYears]);

  // Check if we have data for a specific year
  const hasDataForYear = useCallback((year: string) => {
    if (!allPromptsMetrics || allPromptsMetrics.length === 0) return false;
    
    return allPromptsMetrics.some(metric => metric.year === year);
  }, [allPromptsMetrics]);

  return {
    allPromptsMetrics,
    isLoading,
    error,
    currentYear,
    fetchData,
    fetchAllData,
    fetchDataForYear,
    changeYear,
    clearErrorState,
    getAvailableYears,
    hasAllData,
    hasDataForYear,
  };
};
