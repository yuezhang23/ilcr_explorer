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
  allPromptsMetrics: any[];
  isLoading: boolean;
  error: string | null;
  fetchData: (year: string) => void;
  clearErrorState: () => void;
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

const PredictionErrors: React.FC<PredictionErrorsProps> = ({
  showMismatch,
  setShowMismatch,
  removeButton,
  // Prediction stats props
  allPromptsMetrics,
  isLoading,
  error,
  fetchData,
  clearErrorState,
}) => {
  // Local state for year and prompt selections
  const [selectedYear, setSelectedYear] = useState<string>('2024');
  const [selectedPrompt, setSelectedPrompt] = useState<string>(home.BASIC_PROMPT);
  const [showRebuttal, setShowRebuttal] = useState(false);
  const [isSettingYear, setIsSettingYear] = useState<boolean>(false);
  const [isAbstractExpanded, setIsAbstractExpanded] = useState<boolean>(false);

  // Local variable for current year
  const currentYear = selectedYear;

  // Handle year selection change
  const handleYearChange = useCallback((year: string) => {
    setSelectedYear(year);
  }, []);

  // Handle prompt selection change
  const handlePromptChange = useCallback((prompt: string) => {
    setSelectedPrompt(prompt);
  }, []);


  // Find the metrics for the selected prompt and year
  const currentPromptMetrics = useMemo(() => {
    // Try to find exact match first
    let found = allPromptsMetrics.find(metrics => 
      metrics.prompt === selectedPrompt && metrics.year === selectedYear
    );
    
    // If no exact match, try to find by prompt type (fallback)
    if (!found && allPromptsMetrics.length > 0) {
      // Find the first prompt of type -1 (initial prompt type)
      found = allPromptsMetrics.find(metrics => 
        metrics.type === -1 && metrics.year === selectedYear
      );
      if (found) {
        // Update the selected prompt to match what we found
        setSelectedPrompt(found.prompt);
      }
    }
    
    return found;
  }, [allPromptsMetrics, selectedPrompt, selectedYear]);

  // Get the appropriate confusion matrix and metrics based on rebuttal toggle
  const { confusionMatrixData, nonRebuttalMetrics, rebuttalMetrics } = useMemo(() => {
    if (!currentPromptMetrics) {
      return {
        confusionMatrixData: { 
          nonRebuttal: { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 },
          rebuttal: { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 }
        },
        nonRebuttalMetrics: { accuracy: '0.0', precision: '0.0', recall: '0.0', f1Score: '0.0', total: 0 },
        rebuttalMetrics: { accuracy: '0.0', precision: '0.0', recall: '0.0', f1Score: '0.0', total: 0 }
      };
    }

    return {
      confusionMatrixData: {
        nonRebuttal: currentPromptMetrics.nonRebuttalMatrix,
        rebuttal: currentPromptMetrics.rebuttalMatrix
      },
      nonRebuttalMetrics: currentPromptMetrics.nonRebuttalMetrics,
      rebuttalMetrics: currentPromptMetrics.rebuttalMetrics
    };
  }, [currentPromptMetrics]);

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
  if (isLoading) {
    return (
      <div className="prediction-errors">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="mt-3 text-muted">
              Loading prediction stats...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="prediction-errors">
        <div className="alert alert-danger" role="alert">
          <strong>Error:</strong> {error}
          <button 
            className="btn btn-sm btn-outline-danger ms-3" 
            onClick={clearErrorState}
          >
            Dismiss
          </button>
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
                    isLoading={isSettingYear}
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
            </div>
          </div>

        </>
      )}

    </div>
  );
};

export default PredictionErrors; 