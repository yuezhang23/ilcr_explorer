import React, { useState, useEffect, useCallback } from 'react';
import { usePredictionStats } from '../../hooks/usePredictionStats';
import * as home from '../home';
import { FaEye, FaEyeSlash } from 'react-icons/fa6';

// Types are now imported from the reducer

interface ComprehensiveMetricsTableProps {
  // Remove selectedYear prop since we'll use global context
}

const ComprehensiveMetricsTable: React.FC<ComprehensiveMetricsTableProps> = () => {
  const { allPromptsMetrics, isLoading, error, currentYear, fetchDataForYear, changeYear, clearErrorState } = usePredictionStats();
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set());

  // Get available years from the data
  const availableYears = ['2024', '2025', '2026'];

  // calculateMetrics function is now in the reducer

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

  // Effect to fetch prediction stats when year changes
  useEffect(() => {
    fetchDataForYear(currentYear);
  }, [currentYear, fetchDataForYear]);

  // Effect to clear error when year changes
  useEffect(() => {
    clearErrorState();
  }, [currentYear, clearErrorState]);

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
                onChange={(e) => {
                  changeYear(e.target.value);
                }}
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
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
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
                 onClick={() => fetchDataForYear(currentYear)}
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
                <React.Fragment key={`prompt-${index}`}>
                  {/* Non-Rebuttal Row */}
                  <tr key={`non-rebuttal-${index}`} style={{ 
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e7eb'
                  }}>
                    <td rowSpan={expandedPrompts.has(index) ? 3 : 2} className="align-middle fw-bold" style={{ 
                      borderColor: '#e5e7eb',
                      color: '#1f2937'
                    }}>
                      <div className="d-flex flex-column align-items-center">

                          {home.PROMPT_CANDIDATES.indexOf(promptMetrics.prompt) >= 0 ? home.PROMPT_CANDIDATES.indexOf(promptMetrics.prompt) + 1 : home.PROMPT_CANDIDATES.length} 

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
                  <tr key={`rebuttal-${index}`} style={{ 
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
                    <tr key={`prompt-content-${index}`} style={{ 
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
                        <div className="bg-light p-3 rounded" >
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