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
  field?: string; // Optional parameter to specify which field contains the rating
}

const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({
  papers,
  currentPrompt,
  predictionsMap,
  field = 'rating', // Default to 'rating' if not specified
}) => {
  const chartData = useMemo(() => {
    // Create bins for rating distribution (0-1, 1-2, ... 9-10)
    const bins = Array(10).fill(0).map((_, i) => ({ min: i, max: i + 1, count: 0, acceptCount: 0, rejectCount: 0, trueAcceptCount: 0, trueRejectCount: 0 }));
    
    console.log(`Processing ${papers.length} papers with ${predictionsMap.size} predictions`);
    
    papers.forEach(paper => {
      const field_value = paper[field];
      const prediction = predictionsMap.get(paper._id);
      const decision = paper.decision === 'Reject' ? 'Reject' : 'Accept';
      
      // Find the appropriate bin
      const binIndex = Math.floor(field_value);
      if (binIndex >= 0 && binIndex < bins.length) {
        bins[binIndex].count++;
        if (prediction && (prediction.toLowerCase() === 'accept' || prediction.toLowerCase() === 'yes')) {
          bins[binIndex].acceptCount++;
        } 
        if (prediction && (prediction.toLowerCase() === 'reject' || prediction.toLowerCase() === 'no')) {
          bins[binIndex].rejectCount++;
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

    // For each bin, create two bars: one for predictions, one for actuals
    const acceptPredData = [];
    const rejectPredData = [];
    const acceptActualData = [];
    const rejectActualData = [];
    for (let i = 0; i < bins.length; i++) {
      acceptPredData.push(bins[i].acceptCount);
      rejectPredData.push(bins[i].rejectCount);
      acceptActualData.push(bins[i].trueAcceptCount);
      rejectActualData.push(bins[i].trueRejectCount);
    }

    return {
      labels,
      datasets: [
        {
          label: `Accept Predictions (${totalAccepts})`,
          data: acceptPredData,
          backgroundColor: 'rgba(75, 192, 192, 0.8)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          stack: 'predictions',
          barPercentage: 0.5,
          categoryPercentage: 0.5,
        },
        {
          label: `Reject Predictions (${totalRejects})`,
          data: rejectPredData,
          backgroundColor: 'rgba(255, 99, 132, 0.8)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          stack: 'predictions',
          barPercentage: 0.5,
          categoryPercentage: 0.5,
        },
        {
          label: `Accept Decisions (${totalTrueAccepts})`,
          data: acceptActualData,
          backgroundColor: 'rgba(75, 192, 192, 0.3)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
          stack: 'actuals',
          barPercentage: 0.5,
          categoryPercentage: 0.5,
        },
        {
          label: `Reject Decisions (${totalTrueRejects})`,
          data: rejectActualData,
          backgroundColor: 'rgba(255, 99, 132, 0.3)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          stack: 'actuals',
          barPercentage: 0.5,
          categoryPercentage: 0.5,
        },
      ],
      stats: {
        totalPapers: totalPapersWithPredictions,
        totalAccepts,
        totalRejects,
        totalTrueAccepts,
        totalTrueRejects,
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
            const acceptCount = chartData.datasets[0].data[dataIndex];
            const rejectCount = chartData.datasets[1].data[dataIndex];
            const trueAcceptCount = chartData.datasets[2].data[dataIndex];
            const trueRejectCount = chartData.datasets[3].data[dataIndex];
            
            const totalPredictions = acceptCount + rejectCount;
            const totalActual = trueAcceptCount + trueRejectCount;
            
            const lines = [];
            
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
      <div style={{ height: '400px', width: '100%' }}>
        <Bar data={chartData} options={options} />
      </div>
      <div className="mt-4 d-flex justify-content-center gap-5">
        <div className="text-center">
          <div className="fw-bold text-primary">{chartData.stats.totalPapers}</div>
          <div className="small text-muted">Total Papers</div>
        </div>
        <div className="text-center">
          <div className="fw-bold text-success">{chartData.stats.totalAccepts}/{chartData.stats.totalTrueAccepts}</div>
          <div className="small text-muted">Accept <br/>Prediction/ Decision</div>
        </div>
        <div className="text-center">
          <div className="fw-bold text-danger">{chartData.stats.totalRejects}/{chartData.stats.totalTrueRejects}</div>
          <div className="small text-muted">Reject <br/>Prediction/ Decision</div>
        </div>
        <div className="text-center">
          <div className="fw-bold text-info">{chartData.stats.avgField}</div>
          <div className="small text-muted">Average {field}</div>
        </div>
      </div>
    </div>
  );
};

export default RatingDistributionChart; 