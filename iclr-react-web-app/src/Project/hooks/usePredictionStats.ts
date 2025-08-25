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
  };
};
