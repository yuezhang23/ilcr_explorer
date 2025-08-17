import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import * as home from '../home';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

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

interface PredictionStatsData {
  year: number;
  conference: string;
  number_of_predictions: number;
  rebuttal_in_review: number;
  FP: number;
  FN: number;
  TP: number;
  TN: number;
}

interface PromptMetrics {
  prompt: string;
  type: number;
  nonRebuttalMatrix: ConfusionMatrix;
  rebuttalMatrix: ConfusionMatrix;
  nonRebuttalMetrics: Metrics;
  rebuttalMetrics: Metrics;
}

interface ComprehensiveMetricsTableProps {
  // Remove selectedYear prop since we'll use global context
}

const ComprehensiveMetricsTable: React.FC<ComprehensiveMetricsTableProps> = () => {
  const [ currentYear, setCurrentYear ] = useState<string>("2024");
  const [allPromptsMetrics, setAllPromptsMetrics] = useState<PromptMetrics[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());

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

  // Toggle prompt expansion
  const togglePrompt = useCallback((index: number) => {
    setExpandedPrompts(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      return newExpanded;
    });
  }, []);

  // Fetch prediction stats data from the schema
  const fetchPredictionStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
            // Fetch prediction stats data for the current year
      const response = await axios.get(`${home.BASE_API}/api/predictionStats/year/${currentYear}`);
      const predictionStats = response.data;
      
      if (!Array.isArray(predictionStats) || predictionStats.length === 0) {
        setError(`No prediction stats data found for year ${currentYear}`);
        return;
      }
      
      const allMetrics: PromptMetrics[] = [];
      
      // Process each prompt's prediction stats
      for (const promptStat of predictionStats) {
          // Find non-rebuttal and rebuttal data for this prompt
          const nonRebuttalData = promptStat.predictions.find((p: PredictionStatsData) => 
            p.year === parseInt(currentYear) && p.rebuttal_in_review === 0
          );
          
          const rebuttalData = promptStat.predictions.find((p: PredictionStatsData) => 
            p.year === parseInt(currentYear) && p.rebuttal_in_review === 1
          );
          
          // Create confusion matrices from the schema data
          const nonRebuttalMatrix: ConfusionMatrix = {
            truePositive: nonRebuttalData?.TP || 0,
            trueNegative: nonRebuttalData?.TN || 0,
            falsePositive: nonRebuttalData?.FP || 0,
            falseNegative: nonRebuttalData?.FN || 0
          };
          
          const rebuttalMatrix: ConfusionMatrix = {
            truePositive: rebuttalData?.TP || 0,
            trueNegative: rebuttalData?.TN || 0,
            falsePositive: rebuttalData?.FP || 0,
            falseNegative: rebuttalData?.FN || 0
          };
          
          // Calculate metrics from the confusion matrices
          const nonRebuttalMetrics = calculateMetrics(nonRebuttalMatrix);
          const rebuttalMetrics = calculateMetrics(rebuttalMatrix);
          
          // Only add prompts that have data for the current year
          if (nonRebuttalData || rebuttalData) {
            allMetrics.push({
              prompt: promptStat.prompt,
              type: promptStat.prompt_type,
              nonRebuttalMatrix,
              rebuttalMatrix,
              nonRebuttalMetrics,
              rebuttalMetrics,
            });
          } else {
            console.warn(`No data found for prompt "${promptStat.prompt}" in year ${currentYear}`);
          }
        }
      
      setAllPromptsMetrics(allMetrics);
      console.log(`Processed metrics for ${allMetrics.length} prompts from prediction stats`);
      console.log('Sample data structure:', predictionStats[0]);
      console.log('Processed metrics:', allMetrics[0]);
      
    } catch (error) {
      console.error('Error fetching prediction stats:', error);
      setError('Failed to fetch prediction stats data');
    } finally {
      setIsLoading(false);
    }
  }, [currentYear]);

  // Effect to fetch prediction stats when year changes
  useEffect(() => {
    fetchPredictionStats();
  }, [currentYear, fetchPredictionStats]);

  // Loading state
  if (isLoading) {
    return (
      <div className="card border-0 shadow-sm mt-4 mx-4" style={{ borderRadius: '12px' }}>
        <div className="card-header prediction-errors-header" style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '12px 12px 0 0'
        }}>
          <div className="d-flex align-items-center">
            <h6 className="mb-0">Prediction Performance Metrics</h6>
          </div>
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100px' }}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-3 text-muted">Loading prediction stats data...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '12px' }}>
      <div className="card-header prediction-errors-header" style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '12px 12px 0 0'
      }}>
        <div className="d-flex justify-content-between align-items-center"> 
          <h6 className="mb-0">Prediction Performance Metrics</h6>
          <div className="d-flex justify-content-end mb-3 align-items-center">
            <div className="me-3">
              <select
                id="yearSelect"
                value={currentYear}
                onChange={(e) => setCurrentYear(e.target.value)}
                className="form-select form-select-sm"
                style={{
                  fontSize: '0.875rem',
                  padding: '6px 12px',
                  borderRadius: '12px',
                  border: '1px solid #667eea',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  minWidth: '80px'
                }}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <button 
              onClick={() => {
                if (expandedPrompts.size === allPromptsMetrics.length) {
                  // If all are expanded, collapse all
                  setExpandedPrompts(new Set());
                } else {
                  // If some or none are expanded, expand all
                  setExpandedPrompts(new Set(allPromptsMetrics.map((_, index) => index)));
                }
              }}
              className="btn btn-sm btn-outline-primary"
              style={{
                fontSize: '0.875rem',
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid #667eea',
                color: 'white',
                transition: 'all 0.3s ease'
              }}
            >
              {expandedPrompts.size === allPromptsMetrics.length ? (
                <>
                  Hide All Prompts
                </>
              ) : (
                <>
                  Show All Prompts
                </>
              )}
            </button>
          </div>
        </div>  
      </div>
      <div className="card-body">
        {/* Show message if no data */}
        {allPromptsMetrics.length === 0 && !isLoading && !error && (
          <div className="text-center py-4">
            <div className="text-muted">
              <i className="fas fa-info-circle me-2"></i>
              No prediction stats data available for the selected year.
            </div>
          </div>
        )}
        {error && (
            <div className="card-body">
             <div className="alert alert-danger" role="alert">
               <i className="fas fa-exclamation-triangle me-2"></i>
               {error}
               <button 
                 className="btn btn-sm btn-outline-danger ms-3" 
                 onClick={fetchPredictionStats}
               >
                 Retry Fetch
               </button>
            </div>
          </div>
        )}
        
        {/* Table only shows when there's data */}
        {allPromptsMetrics.length > 0 && !error && (
          <div className="table-responsive" style={{ maxHeight: '70vh', overflow: 'auto' }}>
          <table className="table table-sm table-bordered" style={{ 
            borderColor: '#e5e7eb',
            fontSize: '0.875rem'
          }}>
            <thead style={{ 
              position: 'sticky', 
              top: 0, 
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              zIndex: 1,
              borderColor: '#e5e7eb'
            }}>
              <tr>
                <th scope="col" rowSpan={2} className="text-center align-middle" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600'
                }}>Prompt</th>
                <th scope="col" rowSpan={2} className="text-center align-middle" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600'
                }}>Prompt Type</th>
                <th scope="col" rowSpan={2} className="text-center align-middle" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600'
                }}>Review Type</th>
                <th scope="col" colSpan={4} className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600'
                }}>Confusion Matrix</th>
                <th scope="col" colSpan={4} className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600'
                }}>Metrics (%)</th>
                <th scope="col" rowSpan={2} className="text-center align-middle" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#374151',
                  fontWeight: '600'
                }}>Total Papers</th>
              </tr>
              <tr>
                <th scope="col" className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>TP</th>
                <th scope="col" className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>TN</th>
                <th scope="col" className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>FP</th>
                <th scope="col" className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>FN</th>
                <th scope="col" className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>Accuracy</th>
                <th scope="col" className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>Precision</th>
                <th scope="col" className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>Recall</th>
                <th scope="col" className="text-center" style={{ 
                  borderColor: '#e5e7eb',
                  color: '#6b7280',
                  fontWeight: '500'
                }}>F1 Score</th>
              </tr>
            </thead>
            <tbody>
              {allPromptsMetrics.map((promptMetrics, index) => (
                <React.Fragment key={index}>
                  {/* Non-Rebuttal Row */}
                  <tr style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb'
                  }}>
                    <td rowSpan={expandedPrompts.has(index) ? 3 : 2} className="align-middle fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#1f2937'
                    }}>
                      <div className="d-flex flex-column align-items-center">

                          {home.PROMPT_CANDIDATES.indexOf(promptMetrics.prompt) > 0 ? home.PROMPT_CANDIDATES.indexOf(promptMetrics.prompt) + 1 : home.PROMPT_CANDIDATES.length} 

                        <button 
                          onClick={() => togglePrompt(index)}
                          className="btn btn-sm rounded-pill"
                          style={{
                            // backgroundColor: expandedPrompts.has(index) ? '#6b7280' : '#667eea',
                            color: 'black',
                            border: 'none',
                            fontSize: '0.8rem',
                            padding: '4px 12px',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          {expandedPrompts.has(index) ? (
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
                    </td>
                    <td rowSpan={expandedPrompts.has(index) ? 3 : 2} className="text-center align-middle" style={{ 
                      borderColor: '#e5e7eb',
                      color: promptMetrics.type === -1 ? '#374151' : 
                             promptMetrics.type === 1 ? '#d97706' : '#059669'
                    }}>{promptMetrics.type === -1 ? "Initial" : promptMetrics.type === 1 ? "APO - Rebuttal" : "APO - Non-Rebuttal"}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#059669' // Green color for non-rebuttal
                    }}>Non-Rebuttal</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.nonRebuttalMatrix.truePositive}</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.nonRebuttalMatrix.trueNegative}</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.nonRebuttalMatrix.falsePositive}</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.nonRebuttalMatrix.falseNegative}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#059669'
                    }}>{promptMetrics.nonRebuttalMetrics.accuracy}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#059669'
                    }}>{promptMetrics.nonRebuttalMetrics.precision}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#059669'
                    }}>{promptMetrics.nonRebuttalMetrics.recall}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#059669'
                    }}>{promptMetrics.nonRebuttalMetrics.f1Score}</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.nonRebuttalMetrics.total}</td>
                  </tr>
                  {/* Rebuttal Row */}
                  <tr style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb'
                  }}>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#d97706' // Orange color for rebuttal
                    }}>Rebuttal</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.rebuttalMatrix.truePositive}</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.rebuttalMatrix.trueNegative}</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.rebuttalMatrix.falsePositive}</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.rebuttalMatrix.falseNegative}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#d97706'
                    }}>{promptMetrics.rebuttalMetrics.accuracy}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#d97706'
                    }}>{promptMetrics.rebuttalMetrics.precision}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#d97706'
                    }}>{promptMetrics.rebuttalMetrics.recall}</td>
                    <td className="text-center fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#d97706'
                    }}>{promptMetrics.rebuttalMetrics.f1Score}</td>
                    <td className="text-center" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#374151'
                    }}>{promptMetrics.rebuttalMetrics.total}</td>
                  </tr>
                  {/* Prompt Content Row - Only show when expanded */}
                  {expandedPrompts.has(index) && (
                    <tr style={{ 
                      backgroundColor: '#f8fafc',
                      borderColor: '#e5e7eb'
                    }}>
                      <td colSpan={10} className="p-3" style={{ 
                        borderColor: '#e5e7eb',
                        color: '#374151',
                        fontSize: '0.8rem',
                        lineHeight: '1.3'
                      }}>
                        {/* <div className="fw-bold mb-2">Prompt Content:</div> */}
                        <div className="bg-light p-3 rounded" style={{ 
                          // // backgroundColor: '#f1f5f9',
                          // border: '1px solid #e2e8f0',
                          // whiteSpace: 'pre-wrap',
                          // fontFamily: 'monospace'
                        }}>
                          {promptMetrics.prompt}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveMetricsTable; 