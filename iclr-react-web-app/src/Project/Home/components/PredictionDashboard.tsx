import React, { useEffect, useState, useCallback } from 'react';
import * as home from '../home';
import PredictionErrors from './PredictionErrors';
import { adminStyles } from '../styles/adminStyles';
import '../styles/dashboard.css';
import { FaPlus } from 'react-icons/fa';
import { usePredictionStats } from '../../hooks/usePredictionStats';

interface PredictionDashboardProps {
  className?: string;
}

interface DashboardItem {
  id: string;
  year: string;
  prompt: string;
  // papers: any[];
  rebuttalPredictionsMap: Map<string, string>;
  nonRebuttalPredictionsMap: Map<string, string>;
  isLoading: boolean;
  error?: string;
}

const PredictionDashboard: React.FC<PredictionDashboardProps> = ({ className = '' }) => {
  // Use the prediction stats hook
  const { allPromptsMetrics, isLoading: statsLoading, error: statsError, fetchDataForYear, clearErrorState, getAvailableYears } = usePredictionStats();

  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([
    {
      id: '1',
      year: '2024', // This will be updated once data is loaded
      prompt: home.BASIC_PROMPT,
      // papers: [],
      rebuttalPredictionsMap: new Map(),
      nonRebuttalPredictionsMap: new Map(),
      isLoading: false
    }
  ]);

  // Effect to fetch data when component mounts
  useEffect(() => {
    fetchDataForYear('all');
  }, [fetchDataForYear]);

  // Effect to update the default year once data is loaded
  useEffect(() => {
    if (allPromptsMetrics && allPromptsMetrics.length > 0) {
      const availableYears = getAvailableYears();
      if (availableYears.length > 0) {
        setDashboardItems(prev => prev.map(item => 
          item.id === '1' ? { ...item, year: availableYears[0] } : item
        ));
      }
    }
  }, [allPromptsMetrics, getAvailableYears]);

  // Add new dashboard card
  const addDashboardCard = useCallback(() => {
    const newId = (dashboardItems.length + 1).toString();
    const availableYears = getAvailableYears();
    const defaultYear = availableYears.length > 0 ? availableYears[0] : '2024';
    
    const newItem: DashboardItem = {
      id: newId,
      year: defaultYear,
      prompt: home.BASIC_PROMPT,
      // papers: [],
      rebuttalPredictionsMap: new Map(),
      nonRebuttalPredictionsMap: new Map(),
      isLoading: false
    };
    setDashboardItems(prev => [...prev, newItem]);
  }, [dashboardItems.length, getAvailableYears]);

  // Remove dashboard card
  const removeDashboardCard = useCallback((id: string) => {
    setDashboardItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <div className={`prediction-dashboard ${className} mx-4`}>
      {/* Dashboard Header with Plus Button */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <h5 className="m-0 px-0">
                Dashboard
              </h5>
              <button
                className="btn btn-sm border-0 px-0"
                onClick={addDashboardCard}
                title="Add new dashboard card"
              >
                <FaPlus/>
              </button>  
            </div>
            <div className="text-muted">
              {dashboardItems.length} card{dashboardItems.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Cards */}
      {statsLoading ? (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-lg" style={adminStyles.table.card}>
              <div className="card-body p-4">
                <div className="d-flex justify-content-center align-items-center loading-container">
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="mt-3 text-muted">Loading dashboard data...</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          {dashboardItems.map((dashboardItem, index) => (
            <div key={dashboardItem.id} className="col-lg-6 col-xl-4">
              <div 
                className="card border-0  shadow-lg h-100" 
                style={{
                  ...adminStyles.table.card,
                  height: '600px',
                  minHeight: '350px'
                }}
              >
                  {dashboardItem?.error ? (
                    <div className="error-state">
                      <i className="fas fa-exclamation-triangle"></i>
                      <div>{dashboardItem.error}</div>
                    </div>
                  ) : dashboardItem ? (
                    <PredictionErrors
                      showMismatch={false}
                      setShowMismatch={() => {}}
                      removeButton={
                        dashboardItems.length > 1 ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeDashboardCard(dashboardItem.id)}
                            title="Remove dashboard card"
                            style={{
                              backgroundColor: 'rgba(224, 74, 89, 0.42)',
                              borderColor: '#dc3545',
                              color: '#dc3545'
                            }}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        ) : undefined
                      }
                      // Pass prediction stats props
                      allPromptsMetrics={allPromptsMetrics}
                      isLoading={statsLoading}
                      error={statsError}
                      fetchData={fetchDataForYear}
                      clearErrorState={clearErrorState}
                    />
                  ) : null}
                {/* </div> */}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default PredictionDashboard; 