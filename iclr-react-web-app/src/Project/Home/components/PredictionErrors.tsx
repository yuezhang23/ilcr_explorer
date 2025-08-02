import React, { useMemo, useState } from 'react';

interface PredictionErrorsProps {
  papers: any[];
  rebuttalPredictionsMap: Map<string, string>;
  nonRebuttalPredictionsMap: Map<string, string>;
  currentPrompt: string;
}

interface ErrorDetail {
  paperId: string;
  title: string;
  url: string;
  prediction: string;
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
  papers,
  rebuttalPredictionsMap,
  nonRebuttalPredictionsMap,
  currentPrompt,
}) => {
  const [showNonRebuttal, setShowNonRebuttal] = useState(false);
  const [showRebuttal, setShowRebuttal] = useState(false);

  // Helper function to get decision from paper
  const getDecision = (paper: any): string => {
    if (paper.decision) {
      return paper.decision === 'Reject' ? 'Reject' : 'Accept';
    }
    if (paper.decisions?.length > 0) {
      const rejectCount = paper.decisions.filter((d: string) => d === 'Reject').length;
      const acceptCount = paper.decisions.filter((d: string) => d === 'Accept').length;
      return rejectCount > acceptCount ? 'Reject' : 'Accept';
    }
    return 'Accept';
  };

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
  const { nonRebuttalErrors, rebuttalErrors, confusionMatrixData } = useMemo(() => {
    const nonRebuttalErrorIds: string[] = [];
    const rebuttalErrorIds: string[] = [];
    const nonRebuttalMatrix: ConfusionMatrix = { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 };
    const rebuttalMatrix: ConfusionMatrix = { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 };

    papers.forEach(paper => {
      const decision = getDecision(paper);
      
      // Check non-rebuttal predictions
      const nonRebuttalPrediction = nonRebuttalPredictionsMap.get(paper._id);
      if (nonRebuttalPrediction) {
        if (nonRebuttalPrediction !== decision) {
          nonRebuttalErrorIds.push(paper._id);
        }
        updateMatrix(nonRebuttalMatrix, nonRebuttalPrediction, decision);
      }
      
      // Check rebuttal predictions
      const rebuttalPrediction = rebuttalPredictionsMap.get(paper._id);
      if (rebuttalPrediction) {
        if (rebuttalPrediction !== decision) {
          rebuttalErrorIds.push(paper._id);
        }
        updateMatrix(rebuttalMatrix, rebuttalPrediction, decision);
      }
    });

    return {
      nonRebuttalErrors: nonRebuttalErrorIds,
      rebuttalErrors: rebuttalErrorIds,
      confusionMatrixData: { nonRebuttal: nonRebuttalMatrix, rebuttal: rebuttalMatrix }
    };
  }, [papers, rebuttalPredictionsMap, nonRebuttalPredictionsMap]);

  const nonRebuttalMetrics = calculateMetrics(confusionMatrixData.nonRebuttal);
  const rebuttalMetrics = calculateMetrics(confusionMatrixData.rebuttal);

  // Get error details for display
  const getErrorDetails = (paperIds: string[], isRebuttal: boolean): ErrorDetail[] => {
    return paperIds.map(paperId => {
      const paper = papers.find(p => p._id === paperId);
      if (!paper) return null;
      
      const prediction = isRebuttal 
        ? rebuttalPredictionsMap.get(paperId)
        : nonRebuttalPredictionsMap.get(paperId);
      
      return {
        paperId,
        title: paper.title || 'No title',
        url: paper.url || 'No url',
        prediction,
        decision: getDecision(paper),
        rating: paper.rating || 0,
        confidence: paper.confidence || 0
      };
    }).filter(Boolean) as ErrorDetail[];
  };

  const nonRebuttalErrorDetails = getErrorDetails(nonRebuttalErrors, false);
  const rebuttalErrorDetails = getErrorDetails(rebuttalErrors, true);

  // Confusion Matrix Component
  const ConfusionMatrix = ({ matrix, title, metrics }: { matrix: ConfusionMatrix, title: string, metrics: Metrics }) => {
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
      <div className="col-md-6">
        <div className="card border-0 shadow-sm h-100">
          <div className="card-header border-0 mt-2" style={{
            backgroundColor: 'rgba(242, 242, 242, 0.81)',
            color: 'black',
          }}>
            <h6 className="mb-0 fw-bold">{title}</h6>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-sm mb-3" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ border: 'none', background: 'transparent' }}></th>
                    <th scope="col" className="text-center" style={headerStyle}>Accept</th>
                    <th scope="col" className="text-center" style={headerStyle}>Reject</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className="text-center" style={headerStyle}>Accept</th>
                    <td className="text-center fw-bold" style={cellStyle(matrix.truePositive)}>{matrix.truePositive}</td>
                    <td className="text-center fw-bold" style={cellStyle(matrix.falseNegative)}>{matrix.falseNegative}</td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-center" style={headerStyle}>Reject</th>
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
              <small className="text-muted">Total: {metrics.total} papers</small>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Error Table Component
  const ErrorTable = ({ errors, title, errorCount, isVisible, onToggle }: {
    errors: ErrorDetail[];
    title: string;
    errorCount: number;
    isVisible: boolean;
    onToggle: () => void;
  }) => (
    <div className="col-12">
      <div className="card border-0 shadow-sm h-100">
        <div 
          className="card-header border-0" 
          style={{ 
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            transition: 'all 0.3s ease-in-out',
            borderBottom: '2px solid #2196f3'
          }}
          onClick={onToggle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <h6 className="mb-0 d-flex justify-content-between align-items-center fw-bold">
            <span>
              <i className="fas fa-exclamation-triangle me-2" style={{ color: '#f39c12' }}></i>
              {title} - {errorCount}
              <span className="ms-2 text-muted" style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                (Click to {isVisible ? 'collapse' : 'expand'})
              </span>
            </span>
            <div className="d-flex align-items-center">
              <i className={`fas fa-chevron-${isVisible ? 'up' : 'down'} me-2`} style={{ color: '#2196f3' }}></i>
              <i className="fas fa-hand-pointer" style={{ color: '#2196f3', fontSize: '0.8rem' }}></i>
            </div>
          </h6>
        </div>
        {isVisible && (
          <div className="card-body p-0">
            {errors.length > 0 ? (
              <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px' }}>
                <table className="table table-sm table-hover mb-0">
                  <thead className="sticky-top mt-4" style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #dee2e6', paddingTop: '10px' }}>
                    <tr>
                      {['Title', 'Prediction', 'Decision', 'Rating', 'Confidence'].map(header => (
                        <th key={header} scope="col" style={{ 
                          width: header === 'Title' ? '40%' : '15%',
                          backgroundColor: '#e9ecef', 
                          color: '#495057', 
                          fontWeight: '600', 
                          border: 'none' 
                        }} className="text-center">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {errors.map((error, index) => (
                      <tr key={index}>
                        <td className="text-truncate text-center" style={{ maxWidth: '200px', fontSize: '0.85rem' }} title={error.title}>
                          {error.url && error.url !== 'No url' ? (
                            <a href={error.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                              {error.title}
                            </a>
                          ) : (
                            error.title
                          )}
                        </td>
                        <td className="text-center">
                          <span className={`badge ${error.prediction === 'Accept' ? 'bg-success' : 'bg-danger'}`}>
                            {error.prediction}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={`badge ${error.decision === 'Accept' ? 'bg-success' : 'bg-danger'}`}>
                            {error.decision}
                          </span>
                        </td>
                        <td className="text-center" style={{ 
                          color: error.rating > 75 ? '#dc3545' : '#495057',
                          fontWeight: 'normal'
                        }}>{error.rating.toFixed(2)}</td>
                        <td className="text-center" style={{ 
                          color: error.confidence > 75 ? '#dc3545' : '#495057',
                          fontWeight: 'normal'
                        }}>{error.confidence.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-check-circle fa-2x mb-2" style={{ color: '#28a745' }}></i>
                <p>No prediction errors found for {title.toLowerCase()} predictions</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Navigation Button Component
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

  return (
    <div className="prediction-errors">
      {/* Confusion Matrix Summary */}
      {!showNonRebuttal && !showRebuttal && (
        <div className="row">
          <ConfusionMatrix 
            matrix={confusionMatrixData.nonRebuttal} 
            title="Non-Rebuttal" 
            metrics={nonRebuttalMetrics}
          />
          <ConfusionMatrix 
            matrix={confusionMatrixData.rebuttal} 
            title="Rebuttal" 
            metrics={rebuttalMetrics}
          />
        </div>
      )}

      {/* Error Sections */}
      {showNonRebuttal && (
        <div className="row">
          <ErrorTable 
            errors={nonRebuttalErrorDetails}
            title="Non-Rebuttal Mismatch"
            errorCount={nonRebuttalErrors.length}
            isVisible={showNonRebuttal}
            onToggle={() => setShowNonRebuttal(!showNonRebuttal)}
          />
        </div>
      )}
      {showRebuttal && (
        <div className="row">
          <ErrorTable 
            errors={rebuttalErrorDetails}
            title="Rebuttal Mismatch"
            errorCount={rebuttalErrors.length}
            isVisible={showRebuttal}
            onToggle={() => setShowRebuttal(!showRebuttal)}
          />
        </div>
      )}

      {/* Navigation Buttons */}
      {!showNonRebuttal && !showRebuttal && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="d-flex gap-2 justify-content-around">
              <NavButton 
                onClick={() => setShowNonRebuttal(true)}
                bgColor="rgba(37, 118, 224, 0.81)"
              >
                Non-Rebuttal Mismatch
              </NavButton>
              <NavButton 
                onClick={() => setShowRebuttal(true)}
                bgColor="rgba(10, 102, 221, 0.81)"
              >
                Rebuttal Mismatch
              </NavButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionErrors; 