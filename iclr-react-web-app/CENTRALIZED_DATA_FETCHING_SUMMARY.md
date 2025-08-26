# Centralized Data Fetching Implementation Summary

## Problem Identified
The `usePredictionStats` hook was being used by multiple components (`PredictionDashboard` and `ComprehensiveMetricsTable`) with each component independently calling fetch functions, leading to:

1. **Duplicate API calls** - Same data being fetched multiple times
2. **Race conditions** - Multiple requests competing with each other
3. **Unnecessary network traffic** - Wasted API calls
4. **State inconsistencies** - Different components might have different data states

## Solution Implemented

### 1. Enhanced usePredictionStats Hook (`iclr-react-web-app/src/Project/hooks/usePredictionStats.ts`)
- Added `useRef<Set<string>>` to track ongoing fetch requests
- Implemented duplicate request prevention using `fetchingRef.current.has(year)`
- Added data existence checks before making new API calls
- Added helper functions: `hasDataForYear()` and `hasAllData()`

**Key Changes:**
```typescript
// Track ongoing fetch requests to prevent duplicates
const fetchingRef = useRef<Set<string>>(new Set());

const fetchDataForYear = useCallback((year: string) => {
  // If we already have data for this year, don't fetch again
  if (allPromptsMetrics.some(metric => metric.year === year)) {
    return;
  }
  
  // Prevent duplicate fetches for the same year
  if (fetchingRef.current.has(year)) {
    return;
  }
  
  fetchingRef.current.add(year);
  dispatch(fetchAllPredictionStats(year)).finally(() => {
    fetchingRef.current.delete(year);
  });
}, [dispatch, allPromptsMetrics]);
```

### 2. Created PredictionDataProvider Component (`iclr-react-web-app/src/Project/Home/components/PredictionDataProvider.tsx`)
- Centralized data manager that handles all prediction stats data fetching
- Prevents duplicate API calls through smart caching
- Automatically fetches data when needed
- Provides shared state across child components

**Key Features:**
```typescript
// Initialize data fetching when component mounts
useEffect(() => {
  // Set initial year
  changeYear(initialYear);
  
  // Fetch all data once on mount if we don't have it
  if (!hasAllData()) {
    fetchAllData('all');
  }
}, [changeYear, fetchAllData, hasAllData, initialYear]);

// Handle year changes and fetch data if needed
useEffect(() => {
  if (currentYear && !hasDataForYear(currentYear)) {
    fetchAllData(currentYear);
  }
}, [currentYear, fetchAllData, hasDataForYear]);
```

### 3. Updated PredictionDashboard Component (`iclr-react-web-app/src/Project/Home/components/PredictionDashboard.tsx`)
- Removed duplicate `useEffect` that was calling `fetchDataForYear('all')`
- Removed `fetchDataForYear` from hook destructuring
- Updated `PredictionErrors` props to remove `fetchData` dependency

**Changes Made:**
```typescript
// REMOVED: Effect to fetch data when component mounts
// useEffect(() => {
//   fetchDataForYear('all');
// }, [fetchDataForYear]);

// UPDATED: Hook destructuring
const { allPromptsMetrics, isLoading: statsLoading, error: statsError, clearErrorState, getAvailableYears } = usePredictionStats();

// UPDATED: PredictionErrors props
fetchData={() => {}} // No longer needed - data is centralized
```

### 4. Updated ComprehensiveMetricsTable Component (`iclr-react-web-app/src/Project/Home/components/ComprehensiveMetricsTable.tsx`)
- Removed duplicate `useEffect` that was calling `fetchDataForYear(currentYear)`
- Removed `fetchDataForYear` from hook destructuring
- Updated error retry button to use centralized data provider
- Fixed linter errors related to confusion matrix properties

**Changes Made:**
```typescript
// REMOVED: Effect to fetch prediction stats when year changes
// useEffect(() => {
//   fetchDataForYear(currentYear);
// }, [currentYear, fetchDataForYear]);

// UPDATED: Hook destructuring
const { allPromptsMetrics, isLoading, error, currentYear, changeYear, clearErrorState, getAvailableYears } = usePredictionStats();

// UPDATED: Error retry button
onClick={() => {
  // Data will be automatically fetched by the centralized provider
  clearErrorState();
}}
```

### 5. Updated PredictionErrors Component (`iclr-react-web-app/src/Project/Home/components/PredictionErrors.tsx`)
- Removed `fetchData` prop from interface
- Component now receives data as props from parent components
- Pure display component with no data fetching logic

**Changes Made:**
```typescript
interface PredictionErrorsProps {
  showMismatch: boolean;
  setShowMismatch: (show: boolean) => void;
  removeButton?: React.ReactNode;
  allPromptsMetrics: any[];
  isLoading: boolean;
  error: string | null;
  // REMOVED: fetchData: (year: string) => void;
  clearErrorState: () => void;
}
```

### 6. Updated Main Project Router (`iclr-react-web-app/src/Project/index.tsx`)
- Wrapped analytics components with `PredictionDataProvider`
- Ensures centralized data fetching for both dashboard and table views

**Changes Made:**
```typescript
<Route path="Analytics/Dashboard/*" element={
  <PredictionDataProvider initialYear="2024">
    <PredictionDashboard/>
  </PredictionDataProvider>
} />
<Route path="Analytics/Table/*" element={
  <PredictionDataProvider initialYear="2024">
    <ComprehensiveMetricsTable/>
  </PredictionDataProvider>
} />
```

## Benefits Achieved

1. **Eliminated Duplicate API Calls**: Data is now fetched once and shared
2. **Improved Performance**: Reduced network requests and faster loading
3. **Consistent State**: All components see the same data
4. **Better User Experience**: No more loading states from duplicate requests
5. **Easier Maintenance**: Centralized data logic in one place
6. **Smart Caching**: Prevents unnecessary refetches

## Data Flow

1. **PredictionDataProvider** mounts and fetches initial data
2. **Child components** receive data through the Redux store
3. **When year changes**, provider automatically fetches new data if needed
4. **All components** automatically update with new data
5. **No individual components** need to manage data fetching

## Migration Notes

- ✅ Removed `useEffect` calls that fetch data in individual components
- ✅ Removed `fetchData` props from component interfaces
- ✅ Components now rely on centralized data provider
- ✅ Data is automatically available through the Redux store
- ✅ Added comprehensive documentation and README files

## Testing Recommendations

1. **Verify Single API Call**: Check network tab to ensure only one request per year
2. **Test Year Switching**: Ensure data updates correctly when changing years
3. **Check Loading States**: Verify loading indicators work properly
4. **Test Error Handling**: Ensure error states are handled correctly
5. **Performance Testing**: Measure improvement in loading times

## Future Enhancements

1. **Add Request Debouncing**: For rapid year changes
2. **Implement Data Prefetching**: For adjacent years
3. **Add Offline Support**: Cache data in localStorage
4. **Add Request Queuing**: For better request management
5. **Implement Background Refresh**: Keep data fresh automatically
