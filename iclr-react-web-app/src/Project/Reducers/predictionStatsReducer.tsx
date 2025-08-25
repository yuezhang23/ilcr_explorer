import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import * as home from "../Home/home";

// Types
export interface ConfusionMatrix {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
}

export interface Metrics {
  accuracy: string;
  precision: string;
  recall: string;
  f1Score: string;
  total: number;
}

export interface PredictionStatsData {
  year: number;
  rebuttal_in_review: number;
  TP: number;
  TN: number;
  FP: number;
  FN: number;
}

export interface PromptMetrics {
  prompt: string;
  type: number;
  year: string; // Add year field to match what the frontend expects
  nonRebuttalMatrix: ConfusionMatrix;
  rebuttalMatrix: ConfusionMatrix;
  nonRebuttalMetrics: Metrics;
  rebuttalMetrics: Metrics;
}

interface PredictionStatsState {
  allPromptsMetrics: PromptMetrics[];
  isLoading: boolean;
  error: string | null;
  currentYear: string;
}

const initialState: PredictionStatsState = {
  allPromptsMetrics: [],
  isLoading: false,
  error: null,
  currentYear: "2024",
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

// Async thunk for fetching prediction stats
export const fetchPredictionStats = createAsyncThunk(
  'predictionStats/fetchPredictionStats',
  async (year: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${home.BASE_API}/api/predictionStats/year/${year}`);
      const predictionStats = response.data;
      
      if (!Array.isArray(predictionStats) || predictionStats.length === 0) {
        return rejectWithValue(`No prediction stats data found for year ${year}`);
      }
      
      const allMetrics: PromptMetrics[] = [];
      
      // Process each prompt's prediction stats
      for (const promptStat of predictionStats) {
        // Find non-rebuttal and rebuttal data for this prompt
        const nonRebuttalData = promptStat.predictions.find((p: PredictionStatsData) => 
          p.year === parseInt(year) && p.rebuttal_in_review === 0
        );
        
        const rebuttalData = promptStat.predictions.find((p: PredictionStatsData) => 
          p.year === parseInt(year) && p.rebuttal_in_review === 1
        );
        
        // Create confusion matrices from the schema data
        const nonRebuttalMatrix: ConfusionMatrix = {
          truePositive: nonRebuttalData?.TP || 0,
          trueNegative: nonRebuttalData?.TN || 0,
          falsePositive: nonRebuttalData?.FP || 0,
          falseNegative: nonRebuttalData?.FN || 0
        };
        
        const rebuttalMatrix: ConfusionMatrix = {
          truePositive: rebuttalData?.TP || 0,
          trueNegative: rebuttalData?.TN || 0,
          falsePositive: rebuttalData?.FP || 0,
          falseNegative: rebuttalData?.FN || 0
        };
        
        // Calculate metrics from the confusion matrices
        const nonRebuttalMetrics = calculateMetrics(nonRebuttalMatrix);
        const rebuttalMetrics = calculateMetrics(rebuttalMatrix);
        
        // Only add prompts that have data for the current year
        if (nonRebuttalData || rebuttalData) {
          const promptMetrics: PromptMetrics = {
            prompt: promptStat.prompt,
            type: promptStat.prompt_type,
            year: year, // Add the year field that the frontend expects
            nonRebuttalMatrix,
            rebuttalMatrix,
            nonRebuttalMetrics,
            rebuttalMetrics,
          };
          
          allMetrics.push(promptMetrics);
        }
      }
      
      return { allMetrics, year };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch prediction stats data');
    }
  }
);

// Async thunk for fetching all prediction stats (all years)
export const fetchAllPredictionStats = createAsyncThunk(
  'predictionStats/fetchAllPredictionStats',
  async (year: string = 'all', { rejectWithValue }) => {
    try {
      const response = await axios.get(`${home.BASE_API}/api/predictionStats/all`);
      const allPredictionStats = response.data;
      
      if (!Array.isArray(allPredictionStats) || allPredictionStats.length === 0) {
        return rejectWithValue('No prediction stats data found');
      }
      
      const allMetrics: PromptMetrics[] = [];
      
      // Process each prompt's prediction stats for all years
      for (const promptStat of allPredictionStats) {
        // Get all years available for this prompt
        const availableYears = promptStat.predictions.map((p: PredictionStatsData) => p.year);
        
        // If a specific year is requested, filter to only that year and process once
        if (year !== 'all') {
          // For specific year, only process that year once
          const yearToProcess = parseInt(year);
          if (availableYears.includes(yearToProcess)) {
            // Find non-rebuttal and rebuttal data for this prompt and year
            const nonRebuttalData = promptStat.predictions.find((p: PredictionStatsData) => 
              p.year === yearToProcess && p.rebuttal_in_review === 0
            );
            
            const rebuttalData = promptStat.predictions.find((p: PredictionStatsData) => 
              p.year === yearToProcess && p.rebuttal_in_review === 1
            );
            
            // Create confusion matrices from the schema data
            const nonRebuttalMatrix: ConfusionMatrix = {
              truePositive: nonRebuttalData?.TP || 0,
              trueNegative: nonRebuttalData?.TN || 0,
              falsePositive: nonRebuttalData?.FP || 0,
              falseNegative: nonRebuttalData?.FN || 0
            };
            
            const rebuttalMatrix: ConfusionMatrix = {
              truePositive: rebuttalData?.TP || 0,
              trueNegative: rebuttalData?.TN || 0,
              falsePositive: rebuttalData?.FP || 0,
              falseNegative: rebuttalData?.FN || 0
            };
            
            // Calculate metrics from the confusion matrices
            const nonRebuttalMetrics = calculateMetrics(nonRebuttalMatrix);
            const rebuttalMetrics = calculateMetrics(rebuttalMatrix);
            
            // Only add prompts that have data for this year
            if (nonRebuttalData || rebuttalData) {
              const promptMetrics: PromptMetrics = {
                prompt: promptStat.prompt,
                type: promptStat.prompt_type,
                year: yearToProcess.toString(), // Convert year to string to match the interface
                nonRebuttalMatrix,
                rebuttalMatrix,
                nonRebuttalMetrics,
                rebuttalMetrics,
              };
              
              allMetrics.push(promptMetrics);
            }
          }
        } else {
          // For 'all' years, process each year for this prompt
          for (const yearToProcess of availableYears) {
            // Find non-rebuttal and rebuttal data for this prompt and year
            const nonRebuttalData = promptStat.predictions.find((p: PredictionStatsData) => 
              p.year === yearToProcess && p.rebuttal_in_review === 0
            );
            
            const rebuttalData = promptStat.predictions.find((p: PredictionStatsData) => 
              p.year === yearToProcess && p.rebuttal_in_review === 1
            );
            
            // Create confusion matrices from the schema data
            const nonRebuttalMatrix: ConfusionMatrix = {
              truePositive: nonRebuttalData?.TP || 0,
              trueNegative: nonRebuttalData?.TN || 0,
              falsePositive: nonRebuttalData?.FP || 0,
              falseNegative: nonRebuttalData?.FN || 0
            };
            
            const rebuttalMatrix: ConfusionMatrix = {
              truePositive: rebuttalData?.TP || 0,
              trueNegative: rebuttalData?.TN || 0,
              falsePositive: rebuttalData?.FP || 0,
              falseNegative: rebuttalData?.FN || 0
            };
            
            // Calculate metrics from the confusion matrices
            const nonRebuttalMetrics = calculateMetrics(nonRebuttalMatrix);
            const rebuttalMetrics = calculateMetrics(rebuttalMatrix);
            
            // Only add prompts that have data for this year
            if (nonRebuttalData || rebuttalData) {
              const promptMetrics: PromptMetrics = {
                prompt: promptStat.prompt,
                type: promptStat.prompt_type,
                year: yearToProcess.toString(), // Convert year to string to match the interface
                nonRebuttalMatrix,
                rebuttalMatrix,
                nonRebuttalMetrics,
                rebuttalMetrics,
              };
              
              allMetrics.push(promptMetrics);
            }
          }
        }
      }
      
      return { allMetrics, year: year };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all prediction stats data');
    }
  }
);

const predictionStatsSlice = createSlice({
  name: "predictionStats",
  initialState,
  reducers: {
    setCurrentYear: (state, action) => {
      state.currentYear = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMetrics: (state) => {
      state.allPromptsMetrics = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPredictionStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPredictionStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allPromptsMetrics = action.payload.allMetrics;
        state.currentYear = action.payload.year;
        state.error = null;
      })
      .addCase(fetchPredictionStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch prediction stats data';
      })
      .addCase(fetchAllPredictionStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPredictionStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allPromptsMetrics = action.payload.allMetrics;
        if (action.payload.year !== 'all') {
          state.currentYear = action.payload.year;
        }
        state.error = null;
      })
      .addCase(fetchAllPredictionStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Failed to fetch all prediction stats data';
      });
  },
});

export const { setCurrentYear, clearError, clearMetrics } = predictionStatsSlice.actions;
export default predictionStatsSlice.reducer;
