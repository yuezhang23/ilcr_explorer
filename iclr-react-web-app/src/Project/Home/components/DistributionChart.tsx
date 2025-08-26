import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RatingDistributionChartProps {
  papers: any[];
  currentPrompt: string;
  predictionsMap: Map<string, string>;
  rebuttalPredictionsMap?: Map<string, string>; // New: predictions with rebuttal
  nonRebuttalPredictionsMap?: Map<string, string>; // New: predictions without rebuttal
  field?: string; // Optional parameter to specify which field contains the rating
  // Props for controls
  fieldValue: string;
  setField: (value: string) => void;
  isLoadingPredictions?: boolean;
}

const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({
  papers,
  currentPrompt,
  predictionsMap,
  rebuttalPredictionsMap,
  nonRebuttalPredictionsMap,
  field = 'rating', // Default to 'rating' if not specified
  fieldValue,
  setField,
  isLoadingPredictions = false,
}) => {
  const chartData = useMemo(() => {
    // Create bins for rating distribution (0-1, 1-2, ... 9-10)
    const bins = Array(10).fill(0).map((_, i) => ({ 
      min: i, 
      max: i + 1, 
      count: 0, 
      acceptCount: 0, 
      rejectCount: 0, 
      trueAcceptCount: 0, 
      trueRejectCount: 0,
      // New fields for rebuttal comparison
      rebuttalAcceptCount: 0,
      rebuttalRejectCount: 0,
      nonRebuttalAcceptCount: 0,
      nonRebuttalRejectCount: 0
    }));
    
    console.log(`Processing ${papers.length} papers with ${predictionsMap.size} predictions`);
    
    papers.forEach(paper => {
      const field_value = paper[field];
      const prediction = predictionsMap.get(paper._id);
      const rebuttalPrediction = rebuttalPredictionsMap?.get(paper._id);
      const nonRebuttalPrediction = nonRebuttalPredictionsMap?.get(paper._id);
      const decision = paper.decision === 'Reject' ? 'Reject' : 'Accept';
      
      // Skip papers with invalid field values
      if (field_value === undefined || field_value === null || isNaN(field_value)) {
        return;
      }
      
      // Find the appropriate bin
      const binIndex = Math.floor(field_value);
      if (binIndex >= 0 && binIndex < bins.length) {
        bins[binIndex].count++;
        
        // Current predictions (based on toggle)
        if (prediction && (prediction.toLowerCase() === 'accept' || prediction.toLowerCase() === 'yes')) {
          bins[binIndex].acceptCount++;
        } 
        if (prediction && (prediction.toLowerCase() === 'reject' || prediction.toLowerCase() === 'no')) {
          bins[binIndex].rejectCount++;
        }
        
        // Rebuttal predictions (if available)
        if (rebuttalPrediction && (rebuttalPrediction.toLowerCase() === 'accept' || rebuttalPrediction.toLowerCase() === 'yes')) {
          bins[binIndex].rebuttalAcceptCount++;
        }
        if (rebuttalPrediction && (rebuttalPrediction.toLowerCase() === 'reject' || rebuttalPrediction.toLowerCase() === 'no')) {
          bins[binIndex].rebuttalRejectCount++;
        }
        
        // Non-rebuttal predictions (if available)
        if (nonRebuttalPrediction && (nonRebuttalPrediction.toLowerCase() === 'accept' || nonRebuttalPrediction.toLowerCase() === 'yes')) {
          bins[binIndex].nonRebuttalAcceptCount++;
        }
        if (nonRebuttalPrediction && (nonRebuttalPrediction.toLowerCase() === 'reject' || nonRebuttalPrediction.toLowerCase() === 'no')) {
          bins[binIndex].nonRebuttalRejectCount++;
        }
        
        if (decision === 'Reject') {
          bins[binIndex].trueRejectCount++;
        }
        if (decision === 'Accept') {
          bins[binIndex].trueAcceptCount++;
        }
      }
    });

    // Filter out bins with 0 paper count
    const filteredBins = bins.filter(bin => bin.count > 0);

    // Calculate statistics
    const totalPapersWithPredictions = filteredBins.reduce((sum, bin) => sum + bin.count, 0);
    const totalAccepts = filteredBins.reduce((sum, bin) => sum + bin.acceptCount, 0);
    const totalRejects = filteredBins.reduce((sum, bin) => sum + bin.rejectCount, 0);
    const totalTrueAccepts = filteredBins.reduce((sum, bin) => sum + bin.trueAcceptCount, 0);
    const totalTrueRejects = filteredBins.reduce((sum, bin) => sum + bin.trueRejectCount, 0);
    
    // Calculate rebuttal comparison statistics
    const totalRebuttalAccepts = filteredBins.reduce((sum, bin) => sum + bin.rebuttalAcceptCount, 0);
    const totalRebuttalRejects = filteredBins.reduce((sum, bin) => sum + bin.rebuttalRejectCount, 0);
    const totalNonRebuttalAccepts = filteredBins.reduce((sum, bin) => sum + bin.nonRebuttalAcceptCount, 0);
    const totalNonRebuttalRejects = filteredBins.reduce((sum, bin) => sum + bin.nonRebuttalRejectCount, 0);
    
    const validPapers = papers.filter(paper => {
      const field_value = paper[field];
      return field_value !== undefined && field_value !== null && !isNaN(field_value);
    });
    const avgField = validPapers.length > 0 ? validPapers.reduce((sum, paper) => sum + paper[field], 0) / validPapers.length : 0;

    // Log bin summary for debugging
    console.log('Bin summary:', filteredBins.map((bin, i) => ({
      range: `${bin.min}-${bin.max}`,
      total: bin.count,
      accept: bin.acceptCount,
      reject: bin.rejectCount,
      trueAccept: bin.trueAcceptCount,
      trueReject: bin.trueRejectCount
    })));

    // Create separate labels for predictions and actual decisions
    const labels = filteredBins.map(bin => `${bin.min}-${bin.max}`);

    // For each bin, create data arrays for all prediction types
    const acceptPredData = [];
    const rejectPredData = [];
    const acceptActualData = [];
    const rejectActualData = [];
    const rebuttalAcceptData = [];
    const rebuttalRejectData = [];
    const nonRebuttalAcceptData = [];
    const nonRebuttalRejectData = [];
    const paperCountData = []; // Add array for actual paper counts
    
    for (let i = 0; i < filteredBins.length; i++) {
      acceptPredData.push(filteredBins[i].acceptCount);
      rejectPredData.push(filteredBins[i].rejectCount);
      acceptActualData.push(filteredBins[i].trueAcceptCount);
      rejectActualData.push(filteredBins[i].trueRejectCount);
      rebuttalAcceptData.push(filteredBins[i].rebuttalAcceptCount);
      rebuttalRejectData.push(filteredBins[i].rebuttalRejectCount);
      nonRebuttalAcceptData.push(filteredBins[i].nonRebuttalAcceptCount);
      nonRebuttalRejectData.push(filteredBins[i].nonRebuttalRejectCount);
      paperCountData.push(filteredBins[i].count); // Add actual paper count
    }

    // Create datasets array - always show all cases
    const datasets = [];
    
    // Always show both rebuttal and non-rebuttal predictions if available
    if (rebuttalPredictionsMap && nonRebuttalPredictionsMap) {
      datasets.push(
        {
          label: `Predicted Accept of Non-Rebuttal Reviews`,
          data: nonRebuttalAcceptData,
          backgroundColor: 'rgba(34, 139, 34, 0.3)',
          borderColor: 'rgba(34, 139, 34, 0.6)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Predicted Reject of Non-Rebuttal Reviews`,
          data: nonRebuttalRejectData,
          backgroundColor: 'rgba(223, 138, 138, 0.49)',
          borderColor: 'rgba(218, 122, 122, 0.81)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Predicted Accept of Rebuttal Reviews`,
          data: rebuttalAcceptData,
          backgroundColor: 'rgba(46, 204, 113, 0.5)',
          borderColor: 'rgba(46, 204, 113, 0.8)',
          borderWidth: 1,
          stack: 'rebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Predicted Reject of Rebuttal Reviews`,
          data: rebuttalRejectData,
          backgroundColor: 'rgba(231, 76, 60, 0.5)',
          borderColor: 'rgba(231, 76, 60, 0.8)',
          borderWidth: 1,
          stack: 'rebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        }
      );
    } else {
      // Fallback to current predictions if rebuttal data not available
      datasets.push(
        {
          label: `Predicted Accept of Non-Rebuttal Reviews`,
          data: nonRebuttalAcceptData,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: 'rgba(46, 204, 113, 0.9)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Predicted Reject of Non-Rebuttal Reviews`,
          data: nonRebuttalRejectData,
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: 'rgba(231, 76, 60, 0.9)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        }
      );
    }
    
    // Always add actual decisions
    datasets.push(
      {
        label: `Actual Accept`,
        data: acceptActualData,
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
        stack: 'actuals',
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
      {
        label: `Actual Reject`,
        data: rejectActualData,
        backgroundColor: 'rgba(155, 89, 182, 0.8)',
        borderColor: 'rgba(155, 89, 182, 1)', 
        borderWidth: 1,
        stack: 'actuals',
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      } 
    );



    return {
      labels,
      datasets,
      paperCountData, // Add paper count data for table display
      stats: {
        totalPapers: totalPapersWithPredictions,
        totalAccepts,
        totalRejects,
        totalTrueAccepts,
        totalTrueRejects,
        totalRebuttalAccepts,
        totalRebuttalRejects,
        totalNonRebuttalAccepts,
        totalNonRebuttalRejects,
        avgField: avgField.toFixed(2),
      },
    };
  }, [papers, predictionsMap, rebuttalPredictionsMap, nonRebuttalPredictionsMap, currentPrompt, field]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
              legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 10,
            },
          },
        },
      title: {
        display: true,
        text: `${field.charAt(0).toUpperCase() + field.slice(1)} Distribution`,
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        enabled: false,
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Average ' + field.charAt(0).toUpperCase() + field.slice(1) + ' Range',
          font: {
            weight: 'bold' as const,
            size: 14,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Papers',
          font: {
            weight: 'bold' as const,
            size: 14,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },

    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div>
      {/* Chart Controls */}
      <div className="mb-2 bg-light rounded p-2">
        <div className="d-flex justify-content-end">
          <div className="d-flex gap-1">
            {['rating', 'confidence', 'soundness', 'presentation', 'contribution'].map((option) => (
              <button
                key={option}
                className={`btn btn ${fieldValue === option ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setField(option)}
                disabled={isLoadingPredictions}
                style={{ fontSize: '1.0rem', padding: '0.25rem 0.5rem', width: '120px' }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div style={{ height: '450px', width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>

      {/* Rating Distribution Table - Transposed */}
      <div className="mt-2">
        <div className="table-responsive">
          <table className="table table-sm table-bordered" style={{ fontSize: '0.75rem' }}>
            <thead className="table-light">
              <tr>
                <th className="text-center align-middle">
                  Category
                </th>
                {chartData.labels.map((label) => (
                  <th key={label} className="text-center" style={{ minWidth: '60px' }}>
                    {label}
                  </th>
                ))}
                <th className="text-center align-middle">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Non-Rebuttal Predictions Row */}
              <tr>
                <td className="fw-bold text-success">Predicted Accept % - <span className="small text-black">on Non-Rebuttal Reviews</span></td>
                {chartData.labels.map((label, index) => {
                  const nonRebuttalAccept = chartData.datasets[0].data[index];
                  const nonRebuttalReject = chartData.datasets[1].data[index];
                  const total = nonRebuttalAccept + nonRebuttalReject;
                  const rate = total > 0 ? ((nonRebuttalAccept / total) * 100).toFixed(1) : '0.0';
                  return (
                    <td key={label} className="text-center text-success">
                      {total > 0 ? `${rate}%` : '-'}
                    </td>
                  );
                })}
                <td className="text-center fw-bold text-success">
                  {chartData.stats.totalNonRebuttalAccepts + chartData.stats.totalNonRebuttalRejects > 0 
                    ? `${((chartData.stats.totalNonRebuttalAccepts / (chartData.stats.totalNonRebuttalAccepts + chartData.stats.totalNonRebuttalRejects)) * 100).toFixed(1)}%`
                    : '-'}
                </td>
              </tr>
              
              {/* Rebuttal Predictions Row */}
              <tr>
                <td className="fw-bold text-success">Predicted Accept % - <span className="small text-black">on Rebuttal Reviews</span></td>
                {chartData.labels.map((label, index) => {
                  const rebuttalAccept = chartData.datasets[2].data[index];
                  const rebuttalReject = chartData.datasets[3].data[index];
                  const total = rebuttalAccept + rebuttalReject;
                  const rate = total > 0 ? ((rebuttalAccept / total) * 100).toFixed(1) : '0.0';
                  return (
                    <td key={label} className="text-center text-success">
                      {total > 0 ? `${rate}%` : '-'}
                    </td>
                  );
                })}
                <td className="text-center fw-bold text-success">
                  {chartData.stats.totalRebuttalAccepts + chartData.stats.totalRebuttalRejects > 0 
                    ? `${((chartData.stats.totalRebuttalAccepts / (chartData.stats.totalRebuttalAccepts + chartData.stats.totalRebuttalRejects)) * 100).toFixed(1)}%`
                    : '-'}
                </td>
              </tr>
              
              {/* Actual Decisions Row */}
              <tr>
                <td className="fw-bold text-success">Actual Accept %</td>
                {chartData.labels.map((label, index) => {
                  const actualAccept = chartData.datasets[4].data[index];
                  const actualReject = chartData.datasets[5].data[index];
                  const total = actualAccept + actualReject;
                  const rate = total > 0 ? ((actualAccept / total) * 100).toFixed(1) : '0.0';
                  return (
                    <td key={label} className="text-center text-success">
                      {total > 0 ? `${rate}%` : '-'}
                    </td>
                  );
                })}
                <td className="text-center fw-bold text-success">
                  {chartData.stats.totalTrueAccepts + chartData.stats.totalTrueRejects > 0 
                    ? `${((chartData.stats.totalTrueAccepts / (chartData.stats.totalTrueAccepts + chartData.stats.totalTrueRejects)) * 100).toFixed(1)}%`
                    : '-'}
                </td>
              </tr>
              
              {/* Paper Count Row */}
              <tr className="table-light">
                <td className="fw-bold">Paper Count</td>
                {chartData.labels.map((label, index) => {
                  // Use the actual paper count from the bin data
                  const paperCount = chartData.paperCountData[index];
                  return (
                    <td key={label} className="text-center fw-bold">
                      {paperCount > 0 ? paperCount : '-'}
                    </td>
                  );
                })}
                <td className="text-center fw-bold">{chartData.stats.totalPapers}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 d-flex justify-content-center gap-5">
        <div className="text-center">
          <div className="fw-bold text-primary">{chartData.stats.totalPapers}</div>
          <div className="small text-muted">Total Papers</div>
        </div>
        <div className="text-center">
          <div className="fw-bold text-success">{chartData.stats.totalTrueAccepts}</div>
          <div className="small text-muted">Actual Accepted Papers</div>
        </div>
        <div className="text-center">
          <div className="fw-bold text-danger">{chartData.stats.totalTrueRejects}</div>
          <div className="small text-muted">Actual Rejected Papers</div>
        </div>
      </div>
    </div>
  );
};

export default RatingDistributionChart; 