import React, { useMemo, useState } from 'react';

interface PredictionErrorsProps {
  papers: any[];
  rebuttalPredictionsMap: Map<string, string>;
  nonRebuttalPredictionsMap: Map<string, string>;
  currentPrompt: string;
}

const PredictionErrors: React.FC<PredictionErrorsProps> = ({
  papers,
  rebuttalPredictionsMap,
  nonRebuttalPredictionsMap,
  currentPrompt,
}) => {
  // State to control which section is visible
  const [showNonRebuttal, setShowNonRebuttal] = useState(false);
  const [showRebuttal, setShowRebuttal] = useState(false);

  // Create arrays of paper IDs where predictions don't match decisions
  const { nonRebuttalErrors, rebuttalErrors, confusionMatrixData } = useMemo(() => {
    const nonRebuttalErrorIds: string[] = [];
    const rebuttalErrorIds: string[] = [];

    // Initialize confusion matrix data
    const nonRebuttalMatrix = {
      truePositive: 0, // Predicted Accept, Actual Accept
      trueNegative: 0, // Predicted Reject, Actual Reject
      falsePositive: 0, // Predicted Accept, Actual Reject
      falseNegative: 0, // Predicted Reject, Actual Accept
    };

    const rebuttalMatrix = {
      truePositive: 0,
      trueNegative: 0,
      falsePositive: 0,
      falseNegative: 0,
    };

    console.log(`Processing ${papers.length} papers for prediction errors`);
    console.log(`Rebuttal predictions: ${rebuttalPredictionsMap.size}, Non-rebuttal predictions: ${nonRebuttalPredictionsMap.size}`);

    papers.forEach(paper => {
      // Get decision from either the decision field or derive from decisions array
      let decision = 'Accept'; // default
      if (paper.decision) {
        decision = paper.decision === 'Reject' ? 'Reject' : 'Accept';
      } else if (paper.decisions && paper.decisions.length > 0) {
        // If no direct decision field, derive from decisions array (majority vote)
        const rejectCount = paper.decisions.filter((d: string) => d === 'Reject').length;
        const acceptCount = paper.decisions.filter((d: string) => d === 'Accept').length;
        decision = rejectCount > acceptCount ? 'Reject' : 'Accept';
      }
      
      // Check non-rebuttal predictions
      const nonRebuttalPrediction = nonRebuttalPredictionsMap.get(paper._id);
      if (nonRebuttalPrediction) {
        if (nonRebuttalPrediction !== decision) {
          nonRebuttalErrorIds.push(paper._id);
          console.log(`Non-rebuttal error: Paper ${paper._id}, Prediction: ${nonRebuttalPrediction}, Decision: ${decision}`);
        }
        
        // Update confusion matrix
        if (nonRebuttalPrediction === 'Accept' && decision === 'Accept') {
          nonRebuttalMatrix.truePositive++;
        } else if (nonRebuttalPrediction === 'Reject' && decision === 'Reject') {
          nonRebuttalMatrix.trueNegative++;
        } else if (nonRebuttalPrediction === 'Accept' && decision === 'Reject') {
          nonRebuttalMatrix.falsePositive++;
        } else if (nonRebuttalPrediction === 'Reject' && decision === 'Accept') {
          nonRebuttalMatrix.falseNegative++;
        }
      }
      
      // Check rebuttal predictions
      const rebuttalPrediction = rebuttalPredictionsMap.get(paper._id);
      if (rebuttalPrediction) {
        if (rebuttalPrediction !== decision) {
          rebuttalErrorIds.push(paper._id);
          console.log(`Rebuttal error: Paper ${paper._id}, Prediction: ${rebuttalPrediction}, Decision: ${decision}`);
        }
        
        // Update confusion matrix
        if (rebuttalPrediction === 'Accept' && decision === 'Accept') {
          rebuttalMatrix.truePositive++;
        } else if (rebuttalPrediction === 'Reject' && decision === 'Reject') {
          rebuttalMatrix.trueNegative++;
        } else if (rebuttalPrediction === 'Accept' && decision === 'Reject') {
          rebuttalMatrix.falsePositive++;
        } else if (rebuttalPrediction === 'Reject' && decision === 'Accept') {
          rebuttalMatrix.falseNegative++;
        }
      }
    });

    console.log(`Found ${nonRebuttalErrorIds.length} non-rebuttal errors and ${rebuttalErrorIds.length} rebuttal errors`);
    
    return {
      nonRebuttalErrors: nonRebuttalErrorIds,
      rebuttalErrors: rebuttalErrorIds,
      confusionMatrixData: {
        nonRebuttal: nonRebuttalMatrix,
        rebuttal: rebuttalMatrix
      }
    };
  }, [papers, rebuttalPredictionsMap, nonRebuttalPredictionsMap]);

  // Calculate metrics
  const calculateMetrics = (matrix: any) => {
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

  const nonRebuttalMetrics = calculateMetrics(confusionMatrixData.nonRebuttal);
  const rebuttalMetrics = calculateMetrics(confusionMatrixData.rebuttal);

  // Get detailed error information
  const getErrorDetails = (paperIds: string[], isRebuttal: boolean) => {
    return paperIds.map(paperId => {
      const paper = papers.find(p => p._id === paperId);
      if (!paper) return null;
      
      const prediction = isRebuttal 
        ? rebuttalPredictionsMap.get(paperId)
        : nonRebuttalPredictionsMap.get(paperId);
      
      // Get decision from either the decision field or derive from decisions array
      let decision = 'Accept'; // default
      if (paper.decision) {
        decision = paper.decision === 'Reject' ? 'Reject' : 'Accept';
      } else if (paper.decisions && paper.decisions.length > 0) {
        // If no direct decision field, derive from decisions array (majority vote)
        const rejectCount = paper.decisions.filter((d: string) => d === 'Reject').length;
        const acceptCount = paper.decisions.filter((d: string) => d === 'Accept').length;
        decision = rejectCount > acceptCount ? 'Reject' : 'Accept';
      }
      
      return {
        paperId,
        title: paper.title || 'No title',
        url: paper.url || 'No url',
        prediction,
        decision,
        rating: paper.rating || 0,
        confidence: paper.confidence || 0
      };
    }).filter(Boolean);
  };

  const nonRebuttalErrorDetails = getErrorDetails(nonRebuttalErrors, false);
  const rebuttalErrorDetails = getErrorDetails(rebuttalErrors, true);

  // Confusion Matrix Component
  const ConfusionMatrix = ({ matrix, title, metrics }: { matrix: any, title: string, metrics: any }) => (
    <div className="col-md-6">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-header bg-light border-0">
          <h6 className="mb-0 fw-bold">{title}</h6>
        </div>
        <div className="card-body">
          <div className="confusion-matrix">
            <div className="table-responsive">
              <table className="table table-sm mb-3" style={{ border: 'none' }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ border: 'none', background: 'transparent' }}></th>
                    <th scope="col" className="text-center" style={{ 
                      background: '#f8f9fa',
                      color: '#495057',
                      fontWeight: '600',
                      border: 'none',
                      fontSize: '0.85rem'
                    }}>Accept</th>
                    <th scope="col" className="text-center" style={{ 
                      background: '#f8f9fa',
                      color: '#495057',
                      fontWeight: '600',
                      border: 'none',
                      fontSize: '0.85rem'
                    }}>Reject</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row" className="text-center" style={{ 
                      background: '#f8f9fa',
                      color: '#495057',
                      fontWeight: '600',
                      border: 'none',
                      fontSize: '0.85rem'
                    }}>Accept</th>
                    <td className="text-center fw-bold" style={{
                      background: 'rgba(40, 167, 69, 0.08)',
                      color: '#155724',
                      border: 'none',
                      fontSize: '0.9rem'
                    }}>
                      {matrix.truePositive}
                    </td>
                    <td className="text-center fw-bold" style={{
                      background: 'rgba(220, 53, 69, 0.08)',
                      color: '#721c24',
                      border: 'none',
                      fontSize: '0.9rem'
                    }}>
                      {matrix.falseNegative}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row" className="text-center" style={{ 
                      background: '#f8f9fa',
                      color: '#495057',
                      fontWeight: '600',
                      border: 'none',
                      fontSize: '0.85rem'
                    }}>Reject</th>
                    <td className="text-center fw-bold" style={{
                      background: 'rgba(220, 53, 69, 0.08)',
                      color: '#721c24',
                      border: 'none',
                      fontSize: '0.9rem'
                    }}>
                      {matrix.falsePositive}
                    </td>
                    <td className="text-center fw-bold" style={{
                      background: 'rgba(40, 167, 69, 0.08)',
                      color: '#155724',
                      border: 'none',
                      fontSize: '0.9rem'
                    }}>
                      {matrix.trueNegative}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Metrics */}
            <div className="row text-center m-2">
              <div className="col-3">
                <div className="border-end">
                  <div className="h5" style={{ color: '#495057' }}>{metrics.accuracy}%</div>
                  <div className="small text-muted">Accuracy</div>
                </div>
              </div>
              <div className="col-3">
                <div className="border-end">
                  <div className="h5" style={{ color: '#495057' }}>{metrics.precision}%</div>
                  <div className="small text-muted">Precision</div>
                </div>
              </div>
              <div className="col-3">
                <div className="border-end">
                  <div className="h5" style={{ color: '#495057' }}>{metrics.recall}%</div>
                  <div className="small text-muted">Recall</div>
                </div>
              </div>
              <div className="col-3">
                <div>
                  <div className="h5" style={{ color: '#495057' }}>{metrics.f1Score}</div>
                  <div className="small text-muted">F1 Score</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-2">
              <small className="text-muted">Total: {metrics.total} papers</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="prediction-errors">
      {/* Confusion Matrix Summary - shown by default */}
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

      {/* Error Sections - shown when clicked */}
      {(showNonRebuttal || showRebuttal) && (
        <div className="row">
          {/* Non-Rebuttal Errors */}
          {showNonRebuttal && (
            <div className="col-12">
              <div className="card border-0 shadow-sm h-100">
                <div 
                  className="card-header bg-primary-subtle border-0" 
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    borderBottom: '2px solid transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderBottomColor = '#f39c12';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.borderBottomColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  onClick={() => {
                    setShowNonRebuttal(!showNonRebuttal);
                  }}
                >
                  <h6 className="mb-0 d-flex justify-content-between align-items-center fw-bold" style={{ color: '#495057' }}>
                    <span>
                      <i className="fas fa-exclamation-triangle me-2" style={{ color: '#f39c12' }}></i>
                      Non-Rebuttal Prediction ({nonRebuttalErrors.length})
                    </span>
                    <i className={`fas fa-chevron-${showNonRebuttal ? 'up' : 'down'}`} style={{ color: '#6c757d', transition: 'transform 0.2s ease-in-out' }}></i>
                  </h6>
                </div>
                {showNonRebuttal && (
                  <div className="card-body p-0">
                    {nonRebuttalErrorDetails.length > 0 ? (
                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover mb-0">
                          <thead className="sticky-top" style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #dee2e6' }}>
                            <tr>
                              <th scope="col" style={{ width: '40%', backgroundColor: '#e9ecef', color: '#495057', fontWeight: '600', border: 'none' }} className="text-center">Title</th>
                              <th scope="col" style={{ width: '15%', backgroundColor: '#e9ecef', color: '#495057', fontWeight: '600', border: 'none' }} className="text-center">Prediction</th>
                              <th scope="col" style={{ width: '15%', backgroundColor: '#e9ecef', color: '#495057', fontWeight: '600', border: 'none' }} className="text-center">Decision</th>
                              <th scope="col" style={{ width: '15%', backgroundColor: '#e9ecef', color: '#495057', fontWeight: '600', border: 'none' }} className="text-center">Rating</th>
                              <th scope="col" style={{ width: '15%', backgroundColor: '#e9ecef', color: '#495057', fontWeight: '600', border: 'none' }} className="text-center">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {nonRebuttalErrorDetails.map((error, index) => (
                              <tr key={index}>
                                <td className="text-truncate text-center" style={{ maxWidth: '200px', fontSize: '0.85rem' }} title={error.title}>
                                  {error.url && error.url !== 'No url' ? (
                                    <a 
                                      href={error.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-decoration-none"
                                    >
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
                                <td className="text-center">{error.rating.toFixed(2)}</td>
                                <td className="text-center">{error.confidence.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="fas fa-check-circle fa-2x mb-2" style={{ color: '#28a745' }}></i>
                        <p>No prediction errors found for non-rebuttal predictions</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rebuttal Errors */}
          {showRebuttal && (
            <div className="col-12">
              <div className="card border-0 shadow-sm h-100">
                <div 
                  className="card-header bg-primary-subtle border-0" 
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setShowRebuttal(!showRebuttal);
                  }}
                >
                  <h6 className="mb-0 d-flex justify-content-between align-items-center fw-bold">
                    <span>
                      <i className="fas fa-exclamation-triangle me-2" style={{ color: '#e74c3c' }}></i>
                      Rebuttal Prediction Errors : #{rebuttalErrors.length}
                    </span>
                    <i className={`fas fa-chevron-${showRebuttal ? 'up' : 'down'}`} style={{ color: '#6c757d' }}></i>
                  </h6>
                </div>
                {showRebuttal && (
                  <div className="card-body p-0">
                    {rebuttalErrorDetails.length > 0 ? (
                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-sm table-hover mb-0">
                          <thead className="table-light sticky-top">
                            <tr>
                              <th scope="col" style={{ width: '40%' }} className="text-center">Title</th>
                              <th scope="col" style={{ width: '15%' }} className="text-center">Prediction</th>
                              <th scope="col" style={{ width: '15%' }} className="text-center">Decision</th>
                              <th scope="col" style={{ width: '15%' }} className="text-center">Rating</th>
                              <th scope="col" style={{ width: '15%' }} className="text-center">Confidence</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rebuttalErrorDetails.map((error, index) => (
                              <tr key={index}>
                                <td className="text-truncate text-center" style={{ maxWidth: '200px', fontSize: '0.85rem' }} title={error.title}>
                                  {error.url && error.url !== 'No url' ? (
                                    <a 
                                      href={error.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-decoration-none"
                                    >
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
                                <td className="text-center">{error.rating.toFixed(2)}</td>
                                <td className="text-center">{error.confidence.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted">
                        <i className="fas fa-check-circle fa-2x mb-2" style={{ color: '#28a745' }}></i>
                        <p>No prediction errors found for rebuttal predictions</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons - shown when Summary is visible */}
      {!showNonRebuttal && !showRebuttal && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="d-flex gap-2">
              <button 
                className="btn flex-fill"
                style={{ 
                  // very light purple
                  backgroundColor: '#f3f0ff',
                  borderColor: '#ced4da',
                  color: '#212529',
                  fontWeight: '500',
                  borderWidth: '1px',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dee2e6';
                  e.currentTarget.style.borderColor = '#adb5bd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#ced4da';
                }}
                onClick={() => setShowNonRebuttal(true)}
              >
                <i className="fas fa-exclamation-triangle me-2" style={{ color: '#6c757d' }}></i>
                Non-Rebuttal Errors ({nonRebuttalErrors.length})
              </button>
              <button 
                className="btn flex-fill"
                style={{ 
                  backgroundColor: '#f3f0ff', 
                  borderColor: '#ced4da',
                  color: '#212529',
                  fontWeight: '500',
                  borderWidth: '1px',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#dee2e6';
                  e.currentTarget.style.borderColor = '#adb5bd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.borderColor = '#ced4da';
                }}
                onClick={() => setShowRebuttal(true)}
              >
                <i className="fas fa-exclamation-triangle me-2" style={{ color: '#6c757d' }}></i>
                Rebuttal Errors ({rebuttalErrors.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionErrors; 