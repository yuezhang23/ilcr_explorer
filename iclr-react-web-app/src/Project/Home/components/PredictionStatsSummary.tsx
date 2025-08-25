import React from 'react';
import { usePredictionStats } from '../../hooks/usePredictionStats';

const PredictionStatsSummary: React.FC = () => {
  const { allPromptsMetrics, isLoading, error, currentYear } = usePredictionStats();

  if (isLoading) {
    return <div>Loading prediction stats...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (allPromptsMetrics.length === 0) {
    return <div>No prediction stats available for {currentYear}</div>;
  }

  const totalPrompts = allPromptsMetrics.length;
  const totalPapers = allPromptsMetrics.reduce((sum, prompt) => 
    sum + prompt.nonRebuttalMetrics.total + prompt.rebuttalMetrics.total, 0
  );

  return (
    <div className="card border-0 shadow-sm mt-3" style={{ borderRadius: '8px' }}>
      <div className="card-header" style={{ 
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '8px 8px 0 0'
      }}>
        <h6 className="mb-0">Prediction Stats Summary - {currentYear}</h6>
      </div>
      <div className="card-body">
        <div className="row">
          <div className="col-md-6">
            <div className="text-center">
              <h4 className="text-success">{totalPrompts}</h4>
              <p className="text-muted mb-0">Total Prompts</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="text-center">
              <h4 className="text-primary">{totalPapers}</h4>
              <p className="text-muted mb-0">Total Papers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionStatsSummary;
