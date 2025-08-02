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
  showRebuttalComparison?: boolean; // New: whether to show both sets
  field?: string; // Optional parameter to specify which field contains the rating
  // New props for controls
  pub_rebuttal: boolean;
  setPubRebuttal: (value: boolean) => void;
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
  showRebuttalComparison = false,
  field = 'rating', // Default to 'rating' if not specified
  pub_rebuttal,
  setPubRebuttal,
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

    // Calculate statistics
    const totalPapersWithPredictions = bins.reduce((sum, bin) => sum + bin.count, 0);
    const totalAccepts = bins.reduce((sum, bin) => sum + bin.acceptCount, 0);
    const totalRejects = bins.reduce((sum, bin) => sum + bin.rejectCount, 0);
    const totalTrueAccepts = bins.reduce((sum, bin) => sum + bin.trueAcceptCount, 0);
    const totalTrueRejects = bins.reduce((sum, bin) => sum + bin.trueRejectCount, 0);
    
    // Calculate rebuttal comparison statistics
    const totalRebuttalAccepts = bins.reduce((sum, bin) => sum + bin.rebuttalAcceptCount, 0);
    const totalRebuttalRejects = bins.reduce((sum, bin) => sum + bin.rebuttalRejectCount, 0);
    const totalNonRebuttalAccepts = bins.reduce((sum, bin) => sum + bin.nonRebuttalAcceptCount, 0);
    const totalNonRebuttalRejects = bins.reduce((sum, bin) => sum + bin.nonRebuttalRejectCount, 0);
    
    const avgField = papers.reduce((sum, paper) => sum + paper[field], 0) / totalPapersWithPredictions;

    // Log bin summary for debugging
    console.log('Bin summary:', bins.map((bin, i) => ({
      range: `${bin.min}-${bin.max}`,
      total: bin.count,
      accept: bin.acceptCount,
      reject: bin.rejectCount,
      trueAccept: bin.trueAcceptCount,
      trueReject: bin.trueRejectCount
    })));

    // Create separate labels for predictions and actual decisions
    const labels = bins.map(bin => `${bin.min}-${bin.max}`);

    // For each bin, create data arrays for all prediction types
    const acceptPredData = [];
    const rejectPredData = [];
    const acceptActualData = [];
    const rejectActualData = [];
    const rebuttalAcceptData = [];
    const rebuttalRejectData = [];
    const nonRebuttalAcceptData = [];
    const nonRebuttalRejectData = [];
    
    for (let i = 0; i < bins.length; i++) {
      acceptPredData.push(bins[i].acceptCount);
      rejectPredData.push(bins[i].rejectCount);
      acceptActualData.push(bins[i].trueAcceptCount);
      rejectActualData.push(bins[i].trueRejectCount);
      rebuttalAcceptData.push(bins[i].rebuttalAcceptCount);
      rebuttalRejectData.push(bins[i].rebuttalRejectCount);
      nonRebuttalAcceptData.push(bins[i].nonRebuttalAcceptCount);
      nonRebuttalRejectData.push(bins[i].nonRebuttalRejectCount);
    }

    // Create datasets array based on whether we're showing rebuttal comparison
    const datasets = [];
    
    if (showRebuttalComparison && rebuttalPredictionsMap && nonRebuttalPredictionsMap) {
      // Show both rebuttal and non-rebuttal predictions
      datasets.push(
        {
          label: `Non-Rebuttal Accept`,
          data: nonRebuttalAcceptData,
          backgroundColor: 'rgba(46, 204, 113, 0.5)',
          borderColor: 'rgba(46, 204, 113, 0.8)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Non-Rebuttal Reject`,
          data: nonRebuttalRejectData,
          backgroundColor: 'rgba(231, 76, 60, 0.5)',
          borderColor: 'rgba(231, 76, 60, 0.8)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Rebuttal Accept`,
          data: rebuttalAcceptData,
          backgroundColor: 'rgba(46, 204, 113, 0.5)',
          borderColor: 'rgba(46, 204, 113, 0.8)',
          borderWidth: 1,
          stack: 'rebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Rebuttal Reject`,
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
      // Show current predictions and actual decisions
      datasets.push(
        {
          label: `Non-Rebuttal Accept`,
          data: nonRebuttalAcceptData,
          backgroundColor: 'rgba(46, 204, 113, 0.7)',
          borderColor: 'rgba(46, 204, 113, 0.9)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Non-Rebuttal Reject`,
          data: nonRebuttalRejectData,
          backgroundColor: 'rgba(231, 76, 60, 0.7)',
          borderColor: 'rgba(231, 76, 60, 0.9)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },

      );
    }
    
    // Always add actual decisions
    datasets.push(
      {
        label: `Accept Decisions (${totalTrueAccepts})`,
        data: acceptActualData,
        // backgroundColor: 'rgba(34, 139, 34, 0.7)',
        // borderColor: 'rgba(34, 139, 34, 0.9)',
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
        stack: 'actuals',
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      },
      {
        label: `Reject Decisions (${totalTrueRejects})`,
        data: rejectActualData,
        // backgroundColor: 'rgba(220, 20, 60, 0.7)',
        // borderColor: 'rgba(220, 20, 60, 0.9)',
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
  }, [papers, predictionsMap, field]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
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
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          afterBody: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const lines = [];
            
            if (showRebuttalComparison && rebuttalPredictionsMap && nonRebuttalPredictionsMap) {
              // Handle rebuttal comparison tooltip
              const nonRebuttalAcceptCount = chartData.datasets[0].data[dataIndex];
              const nonRebuttalRejectCount = chartData.datasets[1].data[dataIndex];
              const rebuttalAcceptCount = chartData.datasets[2].data[dataIndex];
              const rebuttalRejectCount = chartData.datasets[3].data[dataIndex];
              const trueAcceptCount = chartData.datasets[4].data[dataIndex];
              const trueRejectCount = chartData.datasets[5].data[dataIndex];
              
              const totalNonRebuttal = nonRebuttalAcceptCount + nonRebuttalRejectCount;
              const totalRebuttal = rebuttalAcceptCount + rebuttalRejectCount;
              const totalActual = trueAcceptCount + trueRejectCount;
              
              if (totalNonRebuttal > 0) {
                const acceptPercent = ((nonRebuttalAcceptCount / totalNonRebuttal) * 100).toFixed(1);
                const rejectPercent = ((nonRebuttalRejectCount / totalNonRebuttal) * 100).toFixed(1);
                lines.push(`Non-Rebuttal - Accept: ${acceptPercent}%, Reject: ${rejectPercent}%`);
              }
              
              if (totalRebuttal > 0) {
                const acceptPercent = ((rebuttalAcceptCount / totalRebuttal) * 100).toFixed(1);
                const rejectPercent = ((rebuttalRejectCount / totalRebuttal) * 100).toFixed(1);
                lines.push(`Rebuttal - Accept: ${acceptPercent}%, Reject: ${rejectPercent}%`);
              }
              
              if (totalActual > 0) {
                const trueAcceptPercent = ((trueAcceptCount / totalActual) * 100).toFixed(1);
                const trueRejectPercent = ((trueRejectCount / totalActual) * 100).toFixed(1);
                lines.push(`Actual - Accept: ${trueAcceptPercent}%, Reject: ${trueRejectPercent}%`);
              }
            } else {
              // Handle regular tooltip
              const acceptCount = chartData.datasets[0].data[dataIndex];
              const rejectCount = chartData.datasets[1].data[dataIndex];
              const trueAcceptCount = chartData.datasets[2].data[dataIndex];
              const trueRejectCount = chartData.datasets[3].data[dataIndex];
              
              const totalPredictions = acceptCount + rejectCount;
              const totalActual = trueAcceptCount + trueRejectCount;
              
              if (totalPredictions > 0) {
                const acceptPercent = ((acceptCount / totalPredictions) * 100).toFixed(1);
                const rejectPercent = ((rejectCount / totalPredictions) * 100).toFixed(1);
                lines.push(`Predictions - Accept: ${acceptPercent}%, Reject: ${rejectPercent}%`);
              }
              
              if (totalActual > 0) {
                const trueAcceptPercent = ((trueAcceptCount / totalActual) * 100).toFixed(1);
                const trueRejectPercent = ((trueRejectCount / totalActual) * 100).toFixed(1);
                lines.push(`Actual - Accept: ${trueAcceptPercent}%, Reject: ${trueRejectPercent}%`);
              }
            }
            
            return lines;
          }
        }
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
      <div className="mb-2 bg-light rounded">
        <div className="d-flex justify-content-end align-items-center">
            <div className="form-check form-switch me-4 mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="rebuttalSwitch"
                checked={pub_rebuttal}
                onChange={() => {
                  setPubRebuttal(!pub_rebuttal);
                }}
                style={{ cursor: 'pointer' }}
                disabled={isLoadingPredictions}
              />
              <label className="form-check-label" htmlFor="rebuttalSwitch" style={{ fontSize: '0.9rem' }}>
                <b>Include Rebuttal</b>
              </label>
            </div>
            <div>
              <select
                className="form-select form-select-sm"
                value={fieldValue}
                onChange={(e) => setField(e.target.value)}
                style={{ fontSize: '0.9rem', width: 'auto', minWidth: '120px' }}
                disabled={isLoadingPredictions}
              >
                <option value="rating">Rating</option>
                <option value="confidence">Confidence</option>
              </select>
            </div>
        </div>
      </div>
      
      <div style={{ height: '400px', width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 d-flex justify-content-center gap-5">
        <div className="text-center">
          <div className="fw-bold text-primary">{chartData.stats.totalPapers}</div>
          <div className="small text-muted">Total Papers</div>
        </div>
        {showRebuttalComparison && rebuttalPredictionsMap && nonRebuttalPredictionsMap ? (
          <>
            <div className="text-center">
              <div className="fw-bold text-success">{chartData.stats.totalNonRebuttalAccepts}/{chartData.stats.totalRebuttalAccepts}/{chartData.stats.totalTrueAccepts}</div>
              <div className="small text-muted">Accept <br/>Non-Rebuttal Pred/ Rebuttal Pred/ Actual</div>
            </div>
            <div className="text-center">
              <div className="fw-bold text-danger">{chartData.stats.totalNonRebuttalRejects}/{chartData.stats.totalRebuttalRejects}/{chartData.stats.totalTrueRejects}</div>
              <div className="small text-muted">Reject <br/>Non-Rebuttal Pred/ Rebuttal Pred/ Actual</div>
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className="fw-bold text-success">{chartData.stats.totalAccepts}/{chartData.stats.totalTrueAccepts}</div>
              <div className="small text-muted">Accept <br/>Prediction/ Decision</div>
            </div>
            <div className="text-center">
              <div className="fw-bold text-danger">{chartData.stats.totalRejects}/{chartData.stats.totalTrueRejects}</div>
              <div className="small text-muted">Reject <br/>Prediction/ Decision</div>
            </div>
          </>
        )}
        <div className="text-center">
          <div className="fw-bold text-info">{chartData.stats.avgField}</div>
          <div className="small text-muted">Average {field}</div>
        </div>
      </div>
    </div>
  );
};

export default RatingDistributionChart; 