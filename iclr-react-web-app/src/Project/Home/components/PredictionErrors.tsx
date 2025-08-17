import React, { useMemo, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import PredictionMismatchTable from './PredictionMismatchTable';
import RebuttalToggle from './RebuttalToggle';
import YearDropdown from './YearDropdown';
import PromptDropdown from './PromptDropdown';
import ComprehensiveMetricsTable from './ComprehensiveMetricsTable';
import * as home from '../home';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

interface PredictionErrorsProps {
  showMismatch: boolean;
  setShowMismatch: (show: boolean) => void;
  removeButton?: React.ReactNode;
}

interface ErrorDetail {
  paperId: string;
  title: string;
  url: string;
  nonRebuttalPrediction: string;
  rebuttalPrediction: string;
  decision: string;
  rating: number;
  confidence: number;
}

interface ConfusionMatrix {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
}

interface Metrics {
  accuracy: string;
  precision: string;
  recall: string;
  f1Score: string;
  total: number;
}



// // Helper function to process papers data (copied from rating.tsx)
// function processPapersData(data: any[]) {
//     return data.map((m: any) => {
//         const {metareviews, ...bib} = m;
//         const ratings = [];
//         const confidences = [];
//         const soundnesses = [];
//         const presentations = [];
//         const contributions = [];
//         const decisions = [];
//         for (const o of metareviews) {
//             if (o.values && o.values.rating) {
//                 const ratingValue = parseFloat(o.values.rating);
//                 if (!isNaN(ratingValue)) {
//                     ratings.push(ratingValue);
//                 }
//             }
//             if (o.values && o.values.confidence) {
//                 const confidenceValue = parseFloat(o.values.confidence);
//                 if (!isNaN(confidenceValue)) {
//                     confidences.push(confidenceValue);
//                 }
//             }
//             if (o.values && o.values.soundness) {
//                 const soundnessValue = parseFloat(o.values.soundness);
//                 if (!isNaN(soundnessValue)) {
//                     soundnesses.push(soundnessValue);
//                 }
//             }
//             if (o.values && o.values.presentation) {
//                 const presentationValue = parseFloat(o.values.presentation);
//                 if (!isNaN(presentationValue)) {
//                     presentations.push(presentationValue);
//                 }
//             }
//             if (o.values && o.values.contribution) {
//                 const contributionValue = parseFloat(o.values.contribution);
//                 if (!isNaN(contributionValue)) {
//                     contributions.push(contributionValue);
//                 }
//             }
//             if (o.values && o.values.decision) {
//                 const decisionValue = o.values.decision.toLowerCase() === 'no' || o.values.decision.toLowerCase() === 'reject' ? 'Reject' : 'Accept';
//                 if (decisionValue) {
//                     decisions.push(decisionValue);
//                 }
//             }
//         }
        
//         const rating = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0;
//         const confidence = confidences.length > 0 ? parseFloat((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)) : 0;
//         const soundness = soundnesses.length > 0 ? parseFloat((soundnesses.reduce((a, b) => a + b, 0) / soundnesses.length).toFixed(2)) : 0;
//         const presentation = presentations.length > 0 ? parseFloat((presentations.reduce((a, b) => a + b, 0) / presentations.length).toFixed(2)) : 0;
//         const contribution = contributions.length > 0 ? parseFloat((contributions.reduce((a, b) => a + b, 0) / contributions.length).toFixed(2)) : 0;

//         return {
//             ...bib,
//             rating,
//             confidence,
//             soundness,
//             presentation,
//             contribution,
//             ratings,
//             confidences,
//             soundnesses,
//             presentations,
//             contributions,
//             decisions
//         };
//     });
// }

const PredictionErrors: React.FC<PredictionErrorsProps> = ({
  showMismatch,
  setShowMismatch,
  removeButton,
}) => {
  // Local state for year and prompt selections
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedPrompt, setSelectedPrompt] = useState<string>(home.BASIC_PROMPT);
  const [showRebuttal, setShowRebuttal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Data state
  // const [allPapers, setAllPapers] = useState<any[]>([]);
  const [rebuttalPredictions, setRebuttalPredictions] = useState<any[]>([]);
  const [nonRebuttalPredictions, setNonRebuttalPredictions] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);
  const [isAbstractExpanded, setIsAbstractExpanded] = useState<boolean>(false);
  


  // Handle year selection change
  const handleYearChange = useCallback(async (year: string) => {
    setSelectedYear(year);
    setIsLoading(true);
    try {
      // Set the global year
      await axios.post('/api/iclr/year', { year });
    } catch (error) {
      console.error('Error setting year:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle prompt selection change
  const handlePromptChange = useCallback((prompt: string) => {
    setSelectedPrompt(prompt);
  }, []);



  // Fetch predictions for the selected prompt and year
  const fetchPredictions = useCallback(async () => {
    setIsLoadingPredictions(true);
    try {
      // Set the global year to fetch predictions for this specific year
      await axios.post('/api/iclr/year', { year: selectedYear });
      
      // Fetch predictions for this year
      const [rebuttalPredictions, nonRebuttalPredictions] = await Promise.all([
        home.getPredsByPromptAndRebuttal(selectedPrompt, 1), // With rebuttal
        home.getPredsByPromptAndRebuttal(selectedPrompt, 0)  // Without rebuttal
      ]);
      
      const processPredictions = (predictions: any[]) => predictions.map((p: any) => ({
        ...p,
        prediction: p.prediction.toLowerCase() === 'yes' || p.prediction.toLowerCase() === 'accept' ? "Accept" 
          : p.prediction.toLowerCase() === 'no' || p.prediction.toLowerCase() === 'reject' ? "Reject" : "O"
      }));
      
      setRebuttalPredictions(processPredictions(rebuttalPredictions));
      setNonRebuttalPredictions(processPredictions(nonRebuttalPredictions));
      
      console.log(`Processed predictions for year ${selectedYear} - Rebuttal: ${rebuttalPredictions.length}, Non-Rebuttal: ${nonRebuttalPredictions.length}`);
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setIsLoadingPredictions(false);
    }
  }, [selectedYear, selectedPrompt]);

  // Effect to fetch data when year changes
  // useEffect(() => {
  //   fetchAllData();
  // }, [fetchAllData]);

  // Effect to fetch predictions when year or prompt changes
  useEffect(() => {
    fetchPredictions();
  }, [selectedYear, selectedPrompt, fetchPredictions]);



  // Memoize processed papers
  // const processedAllPapers = useMemo(() => processPapersData(allPapers), [allPapers]);
  
  // Memoize prediction maps
  const rebuttalPredictionsMap = useMemo(() => {
    const map = new Map();
    rebuttalPredictions.forEach(pred => {
      map.set(pred.paper_id, pred.prediction,);
    });
    return map;
  }, [rebuttalPredictions]);
  
  const nonRebuttalPredictionsMap = useMemo(() => {
    const map = new Map();
    nonRebuttalPredictions.forEach(pred => {
      map.set(pred.paper_id, pred.prediction);
    });
    return map;
  }, [nonRebuttalPredictions]);


  // Helper function to update confusion matrix
  const updateMatrix = (matrix: ConfusionMatrix, prediction: string, decision: string) => {
    if (prediction === 'Accept' && decision === 'Accept') matrix.truePositive++;
    else if (prediction === 'Reject' && decision === 'Reject') matrix.trueNegative++;
    else if (prediction === 'Accept' && decision === 'Reject') matrix.falsePositive++;
    else if (prediction === 'Reject' && decision === 'Accept') matrix.falseNegative++;
  };

  // Calculate metrics from confusion matrix
  const calculateMetrics = (matrix: ConfusionMatrix): Metrics => {
    const total = matrix.truePositive + matrix.trueNegative + matrix.falsePositive + matrix.falseNegative;
    const accuracy = total > 0 ? ((matrix.truePositive + matrix.trueNegative) / total * 100).toFixed(1) : '0.0';
    const precision = (matrix.truePositive + matrix.falsePositive) > 0 ? 
      (matrix.truePositive / (matrix.truePositive + matrix.falsePositive) * 100).toFixed(1) : '0.0';
    const recall = (matrix.truePositive + matrix.falseNegative) > 0 ? 
      (matrix.truePositive / (matrix.truePositive + matrix.falseNegative) * 100).toFixed(1) : '0.0';
    const f1Score = (parseFloat(precision) + parseFloat(recall)) > 0 ? 
      ((2 * parseFloat(precision) * parseFloat(recall)) / (parseFloat(precision) + parseFloat(recall))).toFixed(1) : '0.0';
    
    return { accuracy, precision, recall, f1Score, total };
  };

  // Process papers and calculate errors and matrices
  const { nonRebuttalErrors, rebuttalErrors, confusionMatrixData, predictionMismatches } = useMemo(() => {
    const nonRebuttalErrorIds: string[] = [];
    const rebuttalErrorIds: string[] = [];
    const nonRebuttalMatrix: ConfusionMatrix = { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 };
    const rebuttalMatrix: ConfusionMatrix = { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 };
    const mismatches: ErrorDetail[] = [];

    nonRebuttalPredictions.forEach(pred => {
      const decision = pred.decision;
      const nonRebuttalPrediction = nonRebuttalPredictionsMap.get(pred.paper_id);
      
      // Check non-rebuttal predictions
      if (nonRebuttalPrediction) {
        if (nonRebuttalPrediction !== decision) {
          nonRebuttalErrorIds.push(pred.paper_id);
        }
        updateMatrix(nonRebuttalMatrix, nonRebuttalPrediction, decision);
      }
      
    });

    rebuttalPredictions.forEach(pred => {
      const decision = pred.decision;
      const rebuttalPrediction = rebuttalPredictionsMap.get(pred.paper_id);
      
      // Check rebuttal predictions
      if (rebuttalPrediction) {
        if (rebuttalPrediction !== decision) {
          rebuttalErrorIds.push(pred.paper_id);
        }
        updateMatrix(rebuttalMatrix, rebuttalPrediction, decision);
      }
    });

    return {
      nonRebuttalErrors: nonRebuttalErrorIds,
      rebuttalErrors: rebuttalErrorIds,
      confusionMatrixData: { nonRebuttal: nonRebuttalMatrix, rebuttal: rebuttalMatrix },
      predictionMismatches: mismatches
    };
  }, [rebuttalPredictionsMap, nonRebuttalPredictionsMap]);

  const nonRebuttalMetrics = calculateMetrics(confusionMatrixData.nonRebuttal);
  const rebuttalMetrics = calculateMetrics(confusionMatrixData.rebuttal);

  // Confusion Matrix Component with consistent styling
  const ConfusionMatrixComponent = ({ matrix, title, metrics }: { matrix: ConfusionMatrix, title: string, metrics: Metrics }) => {
    const maxValue = Math.max(matrix.truePositive, matrix.trueNegative, matrix.falsePositive, matrix.falseNegative);
    const getBackgroundOpacity = (value: number) => maxValue === 0 ? 0.1 : 0.1 + (value / maxValue) * 0.6;

    const cellStyle = (value: number) => ({
      background: `rgba(0, 123, 255, ${getBackgroundOpacity(value)})`,
      color: 'black',
      border: 'none',
      fontSize: '0.9rem'
    });

    const headerStyle = {
      background: '#f8f9fa',
      color: '#495057',
      fontWeight: '600',
      border: 'none',
      fontSize: '0.85rem'
    };

    return (
      <div className="col-12">
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm mb-3" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ border: 'none', background: 'transparent' }}></th>
                    <th scope="col" className="text-center" style={headerStyle} colSpan={2}>
                      <div>Predicted</div>
                    </th>
                  </tr>
                  <tr>
                    <th scope="col" style={{ border: 'none', background: 'transparent' }}></th>
                    <th scope="col" className="text-center" style={headerStyle}>Accept</th>
                    <th scope="col" className="text-center" style={headerStyle}>Reject</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className="text-center" style={headerStyle}>
                      <div>Accept</div>
                    </th>
                    <td className="text-center fw-bold" style={cellStyle(matrix.truePositive)}>{matrix.truePositive}</td>
                    <td className="text-center fw-bold" style={cellStyle(matrix.falseNegative)}>{matrix.falseNegative}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-center" style={headerStyle}>
                      <div>Reject</div>
                    </th>
                    <td className="text-center fw-bold" style={cellStyle(matrix.falsePositive)}>{matrix.falsePositive}</td>
                    <td className="text-center fw-bold" style={cellStyle(matrix.trueNegative)}>{matrix.trueNegative}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="row text-center mt-4">
              {[
                { label: 'Accuracy', value: metrics.accuracy },
                { label: 'Precision', value: metrics.precision },
                { label: 'Recall', value: metrics.recall },
                { label: 'F1 Score', value: metrics.f1Score }
              ].map((metric, index) => (
                <div key={metric.label} className="col-3">
                  <div className={index < 3 ? "border-end" : ""}>
                    <div className="h5" style={{ 
                      color: parseFloat(metric.value) > 70 ? '#dc3545' : '#495057',
                      fontWeight: 'normal'
                    }}>{metric.value}{metric.label === 'F1 Score' ? '' : '%'}</div>
                    <div className="small text-muted">{metric.label}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-2">
              <small className="text-muted">Processed: {metrics.total} papers</small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Navigation Button Component with consistent styling
  const NavButton = ({ onClick, children, bgColor }: { onClick: () => void, children: React.ReactNode, bgColor: string }) => (
    <button 
      className="btn btn-sm"
      style={{ 
        backgroundColor: bgColor,
        borderColor: '#ced4da',
        fontWeight: '500',
        borderWidth: '1px',
        transition: 'all 0.2s ease-in-out',
        borderRadius: '10px',
        color: 'white',
        fontSize: '0.875rem',
        padding: '0.375rem 0.75rem'
      }}
      onClick={onClick}
    >
      <i className="fas fa-exclamation-triangle me-2" style={{ color: '#6c757d' }}></i>
      {children}
    </button>
  );

  // Loading state
  if (isLoadingData || isLoadingPredictions) {
    return (
      <div className="prediction-errors">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-3 text-muted">
              {isLoadingData ? 'Loading paper data...' : 'Loading predictions...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="prediction-errors">
      {/* Confusion Matrix Summary */}
      {!showMismatch && (
        <>
          <div className="card border-0 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="card-header prediction-errors-header" style={{ 
              backgroundColor: 'transparent', 
              border: 'none'
            }}>
              { 
                isAbstractExpanded && (
                  <div className="d-flex small text-danger mt-0 p-0 mb-2">
                    {selectedPrompt}
                  </div>
                )
              }
              <div className="d-flex justify-content-between align-items-center ">
                  <YearDropdown
                    selectedYear={selectedYear}
                    onYearChange={handleYearChange}
                    isLoading={isLoading}
                  />
                  <div className="d-flex align-items-center gap-1">
                    <PromptDropdown
                      selectedPrompt={selectedPrompt}
                      onPromptChange={handlePromptChange}
                    />
                    <button 
                        onClick={() => setIsAbstractExpanded(!isAbstractExpanded)}
                        className="btn btn-sm rounded-pill"
                    >
                        {isAbstractExpanded ? (
                            <>
                                <span><FaEyeSlash /></span>
                            </>
                        ) : (
                            <>
                                <span><FaEye /></span> 
                            </>
                        )}
                    </button>
                  </div>
                  <RebuttalToggle
                    checked={showRebuttal}
                    onChange={setShowRebuttal}
                    label="Rebuttal"
                    className="mt-2"
                  />
                  <button
                    className="btn btn-sm border-0 px-0 justify-content-end"
                    // onClick={addSummary}
                  >
                    Table
                  </button>
                {removeButton && (
                  <div className="d-flex justify-content-end">
                    {removeButton}
                  </div>
                )}
              </div>
            </div>
            <div className="card-body">
              <ConfusionMatrixComponent 
                matrix={showRebuttal ? confusionMatrixData.rebuttal : confusionMatrixData.nonRebuttal} 
                title={showRebuttal ? "Rebuttal" : "Non-Rebuttal"} 
                metrics={showRebuttal ? rebuttalMetrics : nonRebuttalMetrics}
              />
              {/* <div className="small text-danger" style={{ 
                wordBreak: 'break-word',
                // maxHeight: '100px',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical'
              }}>
              {selectedPrompt}
              </div> */}
            </div>
          </div>

        </>
      )}

    </div>
  );
};

export default PredictionErrors; 