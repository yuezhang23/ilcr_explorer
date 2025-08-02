import React, { useMemo, useState } from 'react';

interface PredictionMismatchTableProps {
  predictionMismatches: ErrorDetail[];
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

interface Filters {
  nonRebuttalPrediction: string;
  rebuttalPrediction: string;
  decision: string;
  rating: string;
}

const PredictionMismatchTable: React.FC<PredictionMismatchTableProps> = ({
  predictionMismatches,
}) => {
  const [filters, setFilters] = useState<Filters>({
    nonRebuttalPrediction: '',
    rebuttalPrediction: '',
    decision: '',
    rating: ''
  });

  // Filter prediction mismatches based on current filters
  const filteredMismatches = useMemo(() => {
    return predictionMismatches.filter(error => {
      if (filters.nonRebuttalPrediction && error.nonRebuttalPrediction !== filters.nonRebuttalPrediction) return false;
      if (filters.rebuttalPrediction && error.rebuttalPrediction !== filters.rebuttalPrediction) return false;
      if (filters.decision && error.decision !== filters.decision) return false;
      if (filters.rating) {
        if (filters.rating === '<=5.5') {
          if (error.rating > 5.5) return false;
        } else if (filters.rating === '> 5.5 and <= 6') {
          if (error.rating <= 5.5 || error.rating > 6) return false;
        } else if (filters.rating === '> 6') {
          if (error.rating <= 6) return false;
        }
      }
      return true;
    });
  }, [predictionMismatches, filters]);

  // Filter Button Component
  const FilterButton = ({ 
    value, 
    onChange, 
    placeholder,
    column 
  }: { 
    value: string; 
    onChange: (value: string) => void; 
    placeholder: string;
    column?: string;
  }) => {
    const getNextValue = (currentValue: string): string => {
      if (column === 'rating') {
        // Rating-specific cycle: All -> <=5.5 -> > 5.5 and <= 6 -> > 6 -> All
        if (currentValue === '') return '<=5.5';
        if (currentValue === '<=5.5') return '> 5.5 and <= 6';
        if (currentValue === '> 5.5 and <= 6') return '> 6';
        return ''; // Back to "All"
      } else {
        // Standard cycle: All -> Accept -> Reject -> All
        if (currentValue === '') return 'Accept';
        if (currentValue === 'Accept') return 'Reject';
        return ''; // Back to "All"
      }
    };

    const getButtonStyle = (currentValue: string) => {
      const baseStyle = {
        fontSize: '0.7rem',
        padding: '0.25rem 0.5rem',
        minWidth: '70px',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderRadius: '16px',
        border: 'none',
        fontWeight: '500',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        textTransform: 'none' as const,
        letterSpacing: '0.025em'
      };

      if (currentValue === 'Accept') {
        return {
          ...baseStyle,
          backgroundColor: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
          background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
          color: '#155724',
          border: '1px solid rgba(40, 167, 69, 0.3)',
          boxShadow: '0 2px 8px rgba(40, 167, 69, 0.15)'
        };
      } else if (currentValue === 'Reject') {
        return {
          ...baseStyle,
          backgroundColor: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
          background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
          color: '#721c24',
          border: '1px solid rgba(220, 53, 69, 0.3)',
          boxShadow: '0 2px 8px rgba(220, 53, 69, 0.15)'
        };
      } else if (currentValue && column === 'rating') {
        // Rating filter styles
        return {
          ...baseStyle,
          backgroundColor: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          color: '#1976d2',
          border: '1px solid rgba(33, 150, 243, 0.3)',
          boxShadow: '0 2px 8px rgba(33, 150, 243, 0.15)'
        };
      } else {
        return {
          ...baseStyle,
          backgroundColor: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          color: '#6c757d',
          border: '1px solid rgba(108, 117, 125, 0.2)',
          boxShadow: '0 2px 8px rgba(108, 117, 125, 0.1)'
        };
      }
    };

    return (
      <button 
        className="btn btn-sm" 
        type="button"
        style={getButtonStyle(value)}
        onClick={() => onChange(getNextValue(value))}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = getButtonStyle(value).boxShadow;
        }}
      >
        {value || placeholder}
      </button>
    );
  };

  return (
    <div className="col-12">
      <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '12px' }}>
        <div 
          className="card-header border-0" 
          style={{ 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
            transition: 'all 0.3s ease-in-out',
            borderBottom: '2px solid #2196f3'
          }}
        >
          <h6 className="mb-0 d-flex justify-content-between align-items-center fw-bold">
            <span>
              <i className="fas fa-exclamation-triangle me-2" style={{ color: '#f39c12' }}></i>
              Prediction Mismatches ({filteredMismatches.length} of {predictionMismatches.length})
            </span>
          </h6>
        </div>
        <div className="card-body p-0">
          {predictionMismatches.length > 0 ? (
            <div className="table-responsive" style={{ maxHeight: '400px', minHeight: '220px', overflowY: 'auto', marginTop: '10px' }}>
              <table className="table table-sm table-hover mb-0">
                <thead className="sticky-top mt-4" style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #dee2e6', paddingTop: '10px' }}>
                  <tr>
                    <th style={{ 
                      width: '35%',
                      backgroundColor: '#e9ecef', 
                      color: '#495057', 
                      fontWeight: '600', 
                      border: 'none',
                      fontSize: '0.8rem'
                    }} className="text-center pb-3">Title</th>
                    <th style={{ 
                      width: '12%',
                      backgroundColor: '#e9ecef', 
                      color: '#495057', 
                      fontWeight: '600', 
                      border: 'none',
                      fontSize: '0.8rem'
                    }} className="text-center">
                      <div className="d-flex flex-column align-items-center">
                        <div className="mb-1">Non-Rebuttal Pred</div>
                        <FilterButton
                          value={filters.nonRebuttalPrediction}
                          onChange={(value) => setFilters(prev => ({ ...prev, nonRebuttalPrediction: value }))}
                          placeholder="All"
                        />
                      </div>
                    </th>
                    <th style={{ 
                      width: '12%',
                      backgroundColor: '#e9ecef', 
                      color: '#495057', 
                      fontWeight: '600', 
                      border: 'none',
                      fontSize: '0.8rem'
                    }} className="text-center">
                      <div className="d-flex flex-column align-items-center">
                        <div className="mb-1">Rebuttal Pred</div>
                        <FilterButton
                          value={filters.rebuttalPrediction}
                          onChange={(value) => setFilters(prev => ({ ...prev, rebuttalPrediction: value }))}
                          placeholder="All"
                        />
                      </div>
                    </th>
                    <th style={{ 
                      width: '12%',
                      backgroundColor: '#e9ecef', 
                      color: '#495057', 
                      fontWeight: '600', 
                      border: 'none',
                      fontSize: '0.8rem'
                    }} className="text-center">
                      <div className="d-flex flex-column align-items-center">
                        <div className="mb-1">Actual</div>
                        <FilterButton
                          value={filters.decision}
                          onChange={(value) => setFilters(prev => ({ ...prev, decision: value }))}
                          placeholder="All"
                        />
                      </div>
                    </th>
                    <th style={{ 
                      width: '12%',
                      backgroundColor: '#e9ecef', 
                      color: '#495057', 
                      fontWeight: '600', 
                      border: 'none',
                      fontSize: '0.8rem'
                    }} className="text-center">
                      <div className="d-flex flex-column align-items-center">
                        <div className="mb-1">Rating</div>
                        <FilterButton
                          value={filters.rating}
                          onChange={(value) => setFilters(prev => ({ ...prev, rating: value }))}
                          placeholder="All"
                          column="rating"
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMismatches.map((error, index) => (
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
                      <td className="text-center" style={{ 
                        color: error.nonRebuttalPrediction === 'Accept' ? '#28a745' : '#dc3545',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {error.nonRebuttalPrediction}
                      </td>
                      <td className="text-center" style={{ 
                        color: error.rebuttalPrediction === 'Accept' ? '#28a745' : '#dc3545',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {error.rebuttalPrediction}
                      </td>
                      <td className="text-center" style={{ 
                        color: error.decision === 'Accept' ? '#28a745' : '#dc3545',
                        fontSize: '0.8rem',
                        fontWeight: '600'
                      }}>
                        {error.decision}
                      </td>
                      <td className="text-center" style={{ 
                        fontWeight: 'normal'
                      }}>{error.rating.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="fas fa-check-circle fa-2x mb-2" style={{ color: '#28a745' }}></i>
              <p>No prediction mismatches found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionMismatchTable; 