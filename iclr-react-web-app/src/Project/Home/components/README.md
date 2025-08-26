# Centralized Data Fetching for Prediction Stats

## Overview
This directory contains components that use a centralized data fetching approach to prevent duplicate API calls and improve performance.

## Components

### PredictionDataProvider
- **Purpose**: Centralized data manager that handles all prediction stats data fetching
- **Features**: 
  - Prevents duplicate API calls
  - Smart caching based on year
  - Automatic data fetching when needed
  - Shared state across child components

### PredictionDashboard
- **Purpose**: Dashboard component that displays multiple prediction error cards
- **Data Source**: Uses centralized data from PredictionDataProvider
- **No Duplicate Fetching**: Removed individual useEffect data fetching

### ComprehensiveMetricsTable
- **Purpose**: Displays comprehensive metrics table for all prompts
- **Data Source**: Uses centralized data from PredictionDataProvider
- **No Duplicate Fetching**: Removed individual useEffect data fetching

### PredictionErrors
- **Purpose**: Individual prediction error display component
- **Data Source**: Receives data as props from parent components
- **No Fetching**: Pure display component with no data fetching logic

## Usage Example

```tsx
import PredictionDataProvider from './PredictionDataProvider';
import PredictionDashboard from './PredictionDashboard';
import ComprehensiveMetricsTable from './ComprehensiveMetricsTable';

function HomePage() {
  return (
    <PredictionDataProvider initialYear="2024">
      <PredictionDashboard />
      <ComprehensiveMetricsTable />
    </PredictionDataProvider>
  );
}
```

## Benefits

1. **No Duplicate API Calls**: Data is fetched once and shared
2. **Better Performance**: Reduced network requests and faster loading
3. **Consistent State**: All components see the same data
4. **Easier Maintenance**: Centralized data logic in one place
5. **Smart Caching**: Prevents unnecessary refetches

## Data Flow

1. `PredictionDataProvider` mounts and fetches initial data
2. Child components receive data through the Redux store
3. When year changes, provider automatically fetches new data if needed
4. All components automatically update with new data
5. No individual components need to manage data fetching

## Migration Notes

- Remove `useEffect` calls that fetch data in individual components
- Remove `fetchData` props from component interfaces
- Components now rely on centralized data provider
- Data is automatically available through the Redux store
