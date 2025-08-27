import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { flushSync } from 'react-dom';
import axios from 'axios';

interface YearContextType {
  currentYear: string;
  availableYears: string[];
  setYear: (year: string) => Promise<boolean>;
  loading: boolean;
}

const YearContext = createContext<YearContextType | undefined>(undefined);
export const BASE_API = process.env.REACT_APP_API_BASE || 'http://localhost:4000';


export const useYear = () => {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};

// Custom hook for year-dependent data fetching (with parameters)
export const useYearDependentFetch = function<T extends any[], R>(
  fetchFunction: (...args: T) => Promise<R>,
  dependencies: any[] = []
) {
  const { currentYear } = useYear();
  
  const memoizedFetch = useCallback(async (...args: T) => {
    return await fetchFunction(...args);
  }, [currentYear, ...dependencies]);
  
  return memoizedFetch;
};

// Custom hook for year-dependent data fetching (without parameters)
export const useYearDependentFetchSimple = function<R>(
  fetchFunction: () => Promise<R>,
  dependencies: any[] = []
) {
  const { currentYear } = useYear();
  
  const memoizedFetch = useCallback(async () => {
    return await fetchFunction();
  }, [currentYear, ...dependencies]);
  
  return memoizedFetch;
};

interface YearProviderProps {
  children: ReactNode;
}

export const YearProvider: React.FC<YearProviderProps> = ({ children }) => {
  const [currentYear, setCurrentYear] = useState<string>('2024');
  const [availableYears, setAvailableYears] = useState<string[]>(['2024', '2025', '2026']);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper function to validate and set year
  const validateAndSetYear = useCallback((year: string) => {
    if (availableYears.includes(year)) {
      setCurrentYear(year);
      return true;
    }
    console.warn(`Invalid year: ${year}. Available years: ${availableYears.join(', ')}`);
    return false;
  }, [availableYears]);

  // Fetch current year configuration on component mount
  useEffect(() => {
    const fetchYearConfig = async () => {
      try {
        const response = await axios.get(`${BASE_API}/api/iclr/year`);
        setAvailableYears(response.data.availableYears);
        // Validate the fetched year before setting it
        if (response.data.currentYear && response.data.availableYears.includes(response.data.currentYear)) {
          setCurrentYear(response.data.currentYear);
        } else {
          console.warn(`Fetched year ${response.data.currentYear} is not in available years, using default`);
          setCurrentYear('2024');
        }
      } catch (error) {
        console.error('Failed to fetch year configuration:', error);
        // Use default values if fetch fails
        setCurrentYear('2024');
        setAvailableYears(['2024', '2025', '2026']);
      } finally {
        setLoading(false);
      }
    };

    fetchYearConfig();
  }, []);

  // Debug logging for year changes
  useEffect(() => {
    console.log(`YearContext: currentYear changed to: ${currentYear}`);
  }, [currentYear]);

  const setYear = async (year: string): Promise<boolean> => {
    try {
      // Validate that the year is in the available years list
      if (!availableYears.includes(year)) {
        console.warn(`Year ${year} is not in available years: ${availableYears.join(', ')}`);
        return false;
      }

      // Update local state immediately for better UX using flushSync
      flushSync(() => {
        setCurrentYear(prevYear => {
          if (prevYear !== year) {
            console.log(`Year locally updated from ${prevYear} to: ${year}`);
            return year;
          }
          return prevYear;
        });
        
        // Force a re-render by updating loading state temporarily
        setLoading(true);
      });
      
      const response = await axios.post(`${BASE_API}/api/iclr/year`, { year });
      if (response.data.success) {
        console.log(`Year successfully updated on server to: ${year}`);
        setLoading(false);
        return true;
      } else {
        // If server update failed, revert to previous year
        console.error('Server update failed, reverting year change');
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Failed to set year:', error);
      // If API call fails, we keep the local change for better UX
      // The user will see the year they selected, even if it didn't persist on the server
      setLoading(false);
      return false;
    }
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value: YearContextType = useMemo(() => ({
    currentYear,
    availableYears,
    setYear,
    loading
  }), [currentYear, availableYears, loading]);

  return (
    <YearContext.Provider value={value}>
      {children}
    </YearContext.Provider>
  );
}; 