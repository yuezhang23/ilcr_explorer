import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface YearContextType {
  currentYear: string;
  availableYears: string[];
  setYear: (year: string) => Promise<boolean>;
  loading: boolean;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const useYear = () => {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear must be used within a YearProvider');
  }
  return context;
};

interface YearProviderProps {
  children: ReactNode;
}

export const YearProvider: React.FC<YearProviderProps> = ({ children }) => {
  const [currentYear, setCurrentYear] = useState<string>('2024');
  const [availableYears, setAvailableYears] = useState<string[]>(['2024', '2025', '2026']);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch current year configuration on component mount
  useEffect(() => {
    const fetchYearConfig = async () => {
      try {
        const response = await axios.get('/api/iclr/year');
        setCurrentYear(response.data.currentYear);
        setAvailableYears(response.data.availableYears);
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

  const setYear = async (year: string): Promise<boolean> => {
    try {
      const response = await axios.post('/api/iclr/year', { year });
      if (response.data.success) {
        setCurrentYear(response.data.currentYear);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to set year:', error);
      return false;
    }
  };

  const value: YearContextType = {
    currentYear,
    availableYears,
    setYear,
    loading
  };

  return (
    <YearContext.Provider value={value}>
      {children}
    </YearContext.Provider>
  );
}; 