import React, { useMemo } from 'react';
import PredictionMismatchTable from './PredictionMismatchTable';

interface PredictionErrorsProps {
  papers: any[];
  rebuttalPredictionsMap: Map<string, string>;
  nonRebuttalPredictionsMap: Map<string, string>;
  currentPrompt: string;
  showMismatch: boolean;
  setShowMismatch: (show: boolean) => void;
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
  papers,
  rebuttalPredictionsMap,
  nonRebuttalPredictionsMap,
  currentPrompt,
  showMismatch,
  setShowMismatch,
}) => {

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
  const { nonRebuttalErrors, rebuttalErrors, confusionMatrixData, predictionMismatches } = useMemo(() => {
    const nonRebuttalErrorIds: string[] = [];
    const rebuttalErrorIds: string[] = [];
    const nonRebuttalMatrix: ConfusionMatrix = { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 };
    const rebuttalMatrix: ConfusionMatrix = { truePositive: 0, trueNegative: 0, falsePositive: 0, falseNegative: 0 };
    const mismatches: ErrorDetail[] = [];

    papers.forEach(paper => {
      const decision = getDecision(paper);
      const nonRebuttalPrediction = nonRebuttalPredictionsMap.get(paper._id);
      const rebuttalPrediction = rebuttalPredictionsMap.get(paper._id);
      
      // Check non-rebuttal predictions
      if (nonRebuttalPrediction) {
        if (nonRebuttalPrediction !== decision) {
          nonRebuttalErrorIds.push(paper._id);
        }
        updateMatrix(nonRebuttalMatrix, nonRebuttalPrediction, decision);
      }
      
      // Check rebuttal predictions
      if (rebuttalPrediction) {
        if (rebuttalPrediction !== decision) {
          rebuttalErrorIds.push(paper._id);
        }
        updateMatrix(rebuttalMatrix, rebuttalPrediction, decision);
      }

      // Check for mismatches between non-rebuttal and rebuttal predictions
      if (nonRebuttalPrediction && rebuttalPrediction && nonRebuttalPrediction !== rebuttalPrediction) {
        mismatches.push({
          paperId: paper._id,
          title: paper.title || 'No title',
          url: paper.url || 'No url',
          nonRebuttalPrediction,
          rebuttalPrediction,
          decision,
          rating: paper.rating || 0,
          confidence: paper.confidence || 0
        });
      }
    });

    return {
      nonRebuttalErrors: nonRebuttalErrorIds,
      rebuttalErrors: rebuttalErrorIds,
      confusionMatrixData: { nonRebuttal: nonRebuttalMatrix, rebuttal: rebuttalMatrix },
      predictionMismatches: mismatches
    };
  }, [papers, rebuttalPredictionsMap, nonRebuttalPredictionsMap]);



  const nonRebuttalMetrics = calculateMetrics(confusionMatrixData.nonRebuttal);
  const rebuttalMetrics = calculateMetrics(confusionMatrixData.rebuttal);



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
        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
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
      {!showMismatch && (
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

      {/* Prediction Mismatch Table */}
      {showMismatch && (
        <>
          <div className="row">
            <PredictionMismatchTable 
              predictionMismatches={predictionMismatches}
              setShowMismatch={setShowMismatch}
            />
          </div>
        </>
      )}

      {/* Navigation Button */}
      {!showMismatch && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="d-flex justify-content-center">
              <NavButton 
                onClick={() => setShowMismatch(true)}
                bgColor="rgba(37, 118, 224, 0.81)"
              >
                Prediction Mismatches
              </NavButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictionErrors; 