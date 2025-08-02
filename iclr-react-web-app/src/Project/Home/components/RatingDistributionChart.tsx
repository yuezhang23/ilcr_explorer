import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
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
    
    // New arrays for trending curves (acceptance rates)
    const nonRebuttalAcceptanceRateData = [];
    const rebuttalAcceptanceRateData = [];
    const actualAcceptanceRateData = [];
    
    for (let i = 0; i < bins.length; i++) {
      acceptPredData.push(bins[i].acceptCount);
      rejectPredData.push(bins[i].rejectCount);
      acceptActualData.push(bins[i].trueAcceptCount);
      rejectActualData.push(bins[i].trueRejectCount);
      rebuttalAcceptData.push(bins[i].rebuttalAcceptCount);
      rebuttalRejectData.push(bins[i].rebuttalRejectCount);
      nonRebuttalAcceptData.push(bins[i].nonRebuttalAcceptCount);
      nonRebuttalRejectData.push(bins[i].nonRebuttalRejectCount);
      
      // Calculate acceptance rates for trending curves
      const totalNonRebuttal = bins[i].nonRebuttalAcceptCount + bins[i].nonRebuttalRejectCount;
      const totalRebuttal = bins[i].rebuttalAcceptCount + bins[i].rebuttalRejectCount;
      const totalActual = bins[i].trueAcceptCount + bins[i].trueRejectCount;
      
      nonRebuttalAcceptanceRateData.push(totalNonRebuttal > 0 ? (bins[i].nonRebuttalAcceptCount / totalNonRebuttal) * 100 : 0);
      rebuttalAcceptanceRateData.push(totalRebuttal > 0 ? (bins[i].rebuttalAcceptCount / totalRebuttal) * 100 : 0);
      actualAcceptanceRateData.push(totalActual > 0 ? (bins[i].trueAcceptCount / totalActual) * 100 : 0);
    }

    // Create datasets array - always show all cases
    const datasets = [];
    
    // Always show both rebuttal and non-rebuttal predictions if available
    if (rebuttalPredictionsMap && nonRebuttalPredictionsMap) {
      datasets.push(
        {
          label: `Non-Rebuttal Accept`,
          data: nonRebuttalAcceptData,
          backgroundColor: 'rgba(34, 139, 34, 0.3)',
          borderColor: 'rgba(34, 139, 34, 0.6)',
          borderWidth: 1,
          stack: 'nonRebuttal',
          barPercentage: 0.4,
          categoryPercentage: 0.6,
        },
        {
          label: `Non-Rebuttal Reject`,
          data: nonRebuttalRejectData,
          backgroundColor: 'rgba(223, 138, 138, 0.49)',
          borderColor: 'rgba(218, 122, 122, 0.81)',
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
      // Fallback to current predictions if rebuttal data not available
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
        }
      );
    }
    
    // Always add actual decisions
    datasets.push(
      {
        label: `Accept Decisions (${totalTrueAccepts})`,
        data: acceptActualData,
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
        backgroundColor: 'rgba(155, 89, 182, 0.8)',
        borderColor: 'rgba(155, 89, 182, 1)', 
        borderWidth: 1,
        stack: 'actuals',
        barPercentage: 0.5,
        categoryPercentage: 0.6,
      } 
    );

    // Add trending curves for acceptance rates (only for rating field)
    if (field === 'rating') {
      datasets.push(
        {
          label: 'Non-Rebuttal Acceptance Rate (%)',
          data: nonRebuttalAcceptanceRateData,
          type: 'line',
          yAxisID: 'y1',
          borderColor: 'rgba(34, 139, 34, 0.6)',
          backgroundColor: 'rgba(34, 139, 34, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(34, 139, 34, 0.6)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          tension: 0.4,
          hidden: false,
        },
        {
          label: 'Rebuttal Acceptance Rate (%)',
          data: rebuttalAcceptanceRateData,
          type: 'line',
          yAxisID: 'y1',
          borderColor: 'rgba(46, 204, 113, 0.8)',
          backgroundColor: 'rgba(46, 204, 113, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(46, 204, 113, 0.8)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          tension: 0.4,
          hidden: false,
        },
        {
          label: 'Actual Acceptance Rate (%)',
          data: actualAcceptanceRateData,
          type: 'line',
          yAxisID: 'y1',
          borderColor: 'rgba(52, 152, 219, 1)',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          borderDash: [5, 5],
          pointBackgroundColor: 'rgba(52, 152, 219, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 5,
          fill: false,
          tension: 0.4,
          hidden: false,
        }
      );
    }

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
          filter: function(legendItem: any, chartData: any) {
            // Hide trending line labels from legend
            return !legendItem.text.includes('Acceptance Rate (%)');
          },
        },
      },
      title: {
        display: true,
        text: `${field.charAt(0).toUpperCase() + field.slice(1)} Distribution with Acceptance Rate Trends`,
        font: {
          size: 14,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          title: function(context: any) {
            const dataIndex = context[0].dataIndex;
            return `${field.charAt(0).toUpperCase() + field.slice(1)} Range: ${chartData.labels[dataIndex]}`;
          },
          label: function(context: any) {
            const datasetIndex = context.datasetIndex;
            const dataIndex = context.dataIndex;
            
            // Check if this is a trending curve (line chart)
            if (context.dataset.type === 'line') {
              const acceptanceRate = context.parsed.y;
              const caseName = context.dataset.label.replace(' Acceptance Rate (%)', '');
              return `${caseName}: ${acceptanceRate.toFixed(1)}%`;
            }
            
            // For bar charts, use default label
            return context.dataset.label + ': ' + context.parsed.y;
          },
          afterBody: function(context: any) {
            const dataIndex = context[0].dataIndex;
            const lines = [];
            
            if (rebuttalPredictionsMap && nonRebuttalPredictionsMap) {
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
      y1: {
        type: 'linear' as const,
        display: field === 'rating',
        position: 'right' as const,
        title: {
          display: field === 'rating',
          text: 'Acceptance Rate (%)',
          font: {
            weight: 'bold' as const,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
        min: 0,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
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
        {rebuttalPredictionsMap && nonRebuttalPredictionsMap ? (
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