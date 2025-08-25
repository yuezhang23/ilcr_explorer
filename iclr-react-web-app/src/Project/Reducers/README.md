# Reducers Documentation

## Prediction Stats Reducer

The `predictionStatsReducer` provides centralized state management for prediction performance metrics data. It handles fetching, processing, and storing prediction statistics for different prompts and years.

### Features

- **Async Data Fetching**: Uses Redux Toolkit's `createAsyncThunk` for API calls
- **Automatic Data Processing**: Converts raw API data into structured metrics
- **Year-based Filtering**: Supports multiple years (2024, 2025, 2026)
- **Error Handling**: Comprehensive error state management
- **Loading States**: Built-in loading indicators

### State Structure

```typescript
interface PredictionStatsState {
  allPromptsMetrics: PromptMetrics[];  // Processed metrics for all prompts
  isLoading: boolean;                   // Loading state indicator
  error: string | null;                 // Error message if any
  currentYear: string;                  // Currently selected year
}
```

### Data Types

#### ConfusionMatrix
```typescript
interface ConfusionMatrix {
  truePositive: number;
  trueNegative: number;
  falsePositive: number;
  falseNegative: number;
}
```

#### Metrics
```typescript
interface Metrics {
  accuracy: string;      // Percentage as string
  precision: string;     // Percentage as string
  recall: string;        // Percentage as string
  f1Score: string;       // Percentage as string
  total: number;         // Total number of papers
}
```

#### PromptMetrics
```typescript
interface PromptMetrics {
  prompt: string;                    // The actual prompt text
  type: number;                      // Prompt type (-1: Initial, 1: APO-Rebuttal, 0: APO-Non-Rebuttal)
  nonRebuttalMatrix: ConfusionMatrix;
  rebuttalMatrix: ConfusionMatrix;
  nonRebuttalMetrics: Metrics;
  rebuttalMetrics: Metrics;
}
```

### Actions

#### Async Actions
- `fetchPredictionStats(year: string)` - Fetches prediction stats for a specific year

#### Regular Actions
- `setCurrentYear(year: string)` - Updates the current year
- `clearError()` - Clears any error state
- `clearMetrics()` - Resets all metrics data

### Usage

#### 1. Using the Reducer Directly

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { fetchPredictionStats, setCurrentYear } from '../Reducers/predictionStatsReducer';

const MyComponent = () => {
  const dispatch = useDispatch();
  const { allPromptsMetrics, isLoading, error, currentYear } = useSelector(
    (state: RootState) => state.predictionStatsReducer
  );

  const handleYearChange = (year: string) => {
    dispatch(setCurrentYear(year));
    dispatch(fetchPredictionStats(year) as any);
  };

  // ... rest of component
};
```

#### 2. Using the Custom Hook (Recommended)

```typescript
import { usePredictionStats } from '../hooks/usePredictionStats';

const MyComponent = () => {
  const { 
    allPromptsMetrics, 
    isLoading, 
    error, 
    currentYear, 
    fetchData, 
    changeYear, 
    clearErrorState 
  } = usePredictionStats();

  const handleYearChange = (year: string) => {
    changeYear(year);
    fetchData(year);
  };

  // ... rest of component
};
```

### API Endpoint

The reducer expects data from:
```
GET /api/predictionStats/year/{year}
```

### Data Processing

The reducer automatically:
1. Fetches raw prediction stats data
2. Separates rebuttal and non-rebuttal data
3. Creates confusion matrices
4. Calculates accuracy, precision, recall, and F1 scores
5. Structures data for easy consumption by components

### Benefits

- **Reusability**: Multiple components can access the same data
- **Performance**: Data is fetched once and shared across components
- **Consistency**: All components show the same data state
- **Maintainability**: Centralized data fetching and processing logic
- **Type Safety**: Full TypeScript support with proper interfaces

### Example Components

- `ComprehensiveMetricsTable.tsx` - Full metrics table with expandable rows
- `PredictionStatsSummary.tsx` - Simple summary statistics

### Best Practices

1. **Use the custom hook** (`usePredictionStats`) instead of direct reducer access
2. **Handle loading states** in your UI components
3. **Display errors** when they occur
4. **Clear errors** when changing years or retrying
5. **Use the structured data** instead of processing raw API responses
