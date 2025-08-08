import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import * as home from '../home';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectState } from '../../store';
import PredictionErrors from './PredictionErrors';
import { adminStyles } from '../styles/adminStyles';
import '../styles/dashboard.css';
import { FaPlus } from 'react-icons/fa';

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
  const dispatch = useDispatch();
  const { currentIclrName } = useSelector((state: ProjectState) => state.iclrReducer);
  

  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([
    {
      id: '1',
      year: '2024',
      prompt: home.BASIC_PROMPT,
      // papers: [],
      rebuttalPredictionsMap: new Map(),
      nonRebuttalPredictionsMap: new Map(),
      isLoading: false
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Helper function to process papers data (copied from rating.tsx)
    // const processPapersData = useCallback((data: any[]) => {
    //   return data.map((m: any) => {
    //     const { metareviews, ...bib } = m;
    //     const ratings = [];
    //     const confidences = [];
    //     const soundnesses = [];
    //     const presentations = [];
    //     const contributions = [];
    //     const decisions = [];
        
    //     for (const o of metareviews) {
    //       if (o.values && o.values.rating) {
    //         const ratingValue = parseFloat(o.values.rating);
    //         if (!isNaN(ratingValue)) {
    //           ratings.push(ratingValue);
    //         }
    //       }
    //       if (o.values && o.values.confidence) {
    //         const confidenceValue = parseFloat(o.values.confidence);
    //         if (!isNaN(confidenceValue)) {
    //           confidences.push(confidenceValue);
    //         }
    //       }
    //       if (o.values && o.values.soundness) {
    //         const soundnessValue = parseFloat(o.values.soundness);
    //         if (!isNaN(soundnessValue)) {
    //           soundnesses.push(soundnessValue);
    //         }
    //       }
    //       if (o.values && o.values.presentation) {
    //         const presentationValue = parseFloat(o.values.presentation);
    //         if (!isNaN(presentationValue)) {
    //           presentations.push(presentationValue);
    //         }
    //       }
    //       if (o.values && o.values.contribution) {
    //         const contributionValue = parseFloat(o.values.contribution);
    //         if (!isNaN(contributionValue)) {
    //           contributions.push(contributionValue);
    //         }
    //       }
    //       if (o.values && o.values.decision) {
    //         const decisionValue = o.values.decision.toLowerCase() === 'no' || o.values.decision.toLowerCase() === 'reject' ? 'Reject' : 'Accept';
    //         if (decisionValue) {
    //           decisions.push(decisionValue);
    //         }
    //       }
    //     }
        
    //     const rating = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0;
    //     const confidence = confidences.length > 0 ? parseFloat((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)) : 0;
    //     const soundness = soundnesses.length > 0 ? parseFloat((soundnesses.reduce((a, b) => a + b, 0) / soundnesses.length).toFixed(2)) : 0;
    //     const presentation = presentations.length > 0 ? parseFloat((presentations.reduce((a, b) => a + b, 0) / presentations.length).toFixed(2)) : 0;
    //     const contribution = contributions.length > 0 ? parseFloat((contributions.reduce((a, b) => a + b, 0) / contributions.length).toFixed(2)) : 0;

    //     return {
    //       ...bib,
    //       rating,
    //       confidence,
    //       soundness,
    //       presentation,
    //       contribution,
    //       ratings,
    //       confidences,
    //       soundnesses,
    //       presentations,
    //       contributions,
    //       decisions
    //     };
    //   });
    // }, []);

  // Fetch data for a specific year and prompt combination
  const fetchDataForYearAndPrompt = useCallback(async (year: string, prompt: string, id: string): Promise<DashboardItem> => {
    try {
      // Set the global year
      await axios.post('/api/iclr/year', { year });
      
      // Fetch papers data
      // const papersResult = await home.findAllIclrSubmissionsWithPartialMetareviews();
      // const processedPapers = processPapersData(papersResult.data);
      
      // Fetch predictions
      const [rebuttalPredictions, nonRebuttalPredictions] = await Promise.all([
        home.getPredsByPromptAndRebuttal(prompt, 1), // With rebuttal
        home.getPredsByPromptAndRebuttal(prompt, 0)  // Without rebuttal
      ]);
      
      // Process predictions
      const processPredictions = (predictions: any[]) => predictions.map((p: any) => ({
        ...p,
        prediction: p.prediction.toLowerCase() === 'yes' || p.prediction.toLowerCase() === 'accept' ? "Accept" 
          : p.prediction.toLowerCase() === 'no' || p.prediction.toLowerCase() === 'reject' ? "Reject" : "O"
      }));
      
      const processedRebuttalPreds = processPredictions(rebuttalPredictions);
      const processedNonRebuttalPreds = processPredictions(nonRebuttalPredictions);
      
      // Create maps for quick lookup
      const rebuttalPredictionsMap = new Map();
      const nonRebuttalPredictionsMap = new Map();
      
      processedRebuttalPreds.forEach(pred => {
        rebuttalPredictionsMap.set(pred.paper_id, pred.prediction);
      });
      
      processedNonRebuttalPreds.forEach(pred => {
        nonRebuttalPredictionsMap.set(pred.paper_id, pred.prediction);
      });
      
      return {
        id,
        year,
        prompt,
        // papers: processedPapers,
        rebuttalPredictionsMap,
        nonRebuttalPredictionsMap,
        isLoading: false
      };
    } catch (error) {
      console.error(`Error fetching data for year ${year} and prompt ${prompt}:`, error);
      return {
        id,
        year,
        prompt,
        // papers: [],
        rebuttalPredictionsMap: new Map(),
        nonRebuttalPredictionsMap: new Map(),
        isLoading: false,
        error: `Failed to load data for ${year}/${prompt}`
      };
    }
  }, []);

  // Update dashboard items when selections change
  useEffect(() => {
    const updateDashboard = async () => {
      setIsLoading(true);
      const updatedItems = await Promise.all(
        dashboardItems.map(item => fetchDataForYearAndPrompt(item.year, item.prompt, item.id))
      );
      setDashboardItems(updatedItems);
      setIsLoading(false);
    };
    
    updateDashboard();
  }, [fetchDataForYearAndPrompt]);



  // Add new dashboard card
  const addDashboardCard = useCallback(() => {
    const newId = (dashboardItems.length + 1).toString();
    const newItem: DashboardItem = {
      id: newId,
      year: '2024',
      prompt: home.BASIC_PROMPT,
      // papers: [],
      rebuttalPredictionsMap: new Map(),
      nonRebuttalPredictionsMap: new Map(),
      isLoading: false
    };
    setDashboardItems(prev => [...prev, newItem]);
  }, [dashboardItems.length]);

  // Remove dashboard card
  const removeDashboardCard = useCallback((id: string) => {
    setDashboardItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return (
    <div className={`prediction-dashboard ${className} mx-2`}>
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
      {isLoading ? (
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
            <div key={dashboardItem.id} className="col-lg-6 col-xl-4 mb-4">
              <div 
                className="card border-0 py-3 shadow-lg h-100" 
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
                    />
                  ) : null}
                {/* </div> */}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {!isLoading && dashboardItems.length > 0 && (
        <div className="row">

            <div className="card border-0 shadow-lg summary-section" style={adminStyles.table.card}>
              {/* <div className="card-header border-0 py-3" style={adminStyles.table.header}>
                <h6 className="mb-0">
                  <i className="fas fa-chart-pie me-2"></i>
                  Dashboard Summary
                </h6>
              </div> */}
              {/* <div className="card-body p-4"> */}
                {/* <div className="row text-center summary-stats">
                  <div className="col-md-3">
                    <div className="h4">{dashboardItems.length > 0 ? dashboardItems[0].year : 'N/A'}</div>
                    <div className="text-muted">Year</div>
                  </div>
                  <div className="col-md-3">
                    <div className="h4">Prompt {dashboardItems.length > 0 ? home.PROMPT_CANDIDATES.indexOf(dashboardItems[0].prompt) + 1 : 'N/A'}</div>
                    <div className="text-muted">Prompt</div>
                  </div>
                  <div className="col-md-3">
                    <div className="h4">
                      {dashboardItems.reduce((total, item) => total + item.rebuttalPredictionsMap.size, 0)}
                    </div>
                    <div className="text-muted">Processed Papers</div>
                  </div>
                  <div className="col-md-3">
                    <div className="h4">
                      {dashboardItems.reduce((total, item) => 
                        total + item.rebuttalPredictionsMap.size + item.nonRebuttalPredictionsMap.size, 0
                      )}
                    </div>
                    <div className="text-muted">Total Predictions</div>
                  </div>
                </div> */}
              {/* </div> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionDashboard; 