# Global Year System

This document explains the new global year system that has been implemented to manage database collections without requiring year parameters in every function.

## Overview

The global year system allows you to set a single year value that determines which database collection (iclr_2024, iclr_2025, iclr_2026) is used for all operations. This eliminates the need to pass year parameters to every function.

## Backend Changes

### 1. Global Configuration (`iclr-node-server-app/config/globalConfig.js`)

- Manages the current year setting
- Provides functions to get/set the current year
- Validates year values (only 2024, 2025, 2026 are allowed)

### 2. Updated DAO Layer (`iclr-node-server-app/02ICLR/dao.js`)

- All functions now use `getCurrentModel()` instead of requiring year parameters
- The `getCurrentModel()` function automatically selects the correct collection based on the global year setting
- Removed year parameters from all function signatures

### 3. Updated Routes (`iclr-node-server-app/02ICLR/routes.js`)

- Added new endpoints for year management:
  - `POST /api/iclr/year` - Set the current year
  - `GET /api/iclr/year` - Get current year and available years
- Removed year parameters from all route handlers
- Removed conflicting `/api/iclr/year/:year` route

## Frontend Changes

### 1. Year Context (`iclr-react-web-app/src/contexts/YearContext.tsx`)

- React context that manages the global year state
- Automatically fetches current year configuration on app startup
- Provides functions to change the year setting
- Available throughout the application via `useYear()` hook

### 2. Year Selector Component (`iclr-react-web-app/src/components/YearSelector.tsx`)

- Reusable component for changing the year setting
- Automatically updates the global year when changed
- Can be used anywhere in the application

### 3. Updated API Calls (`iclr-react-web-app/src/Project/Home/home.ts`)

- Removed year parameters from API functions
- All API calls now use the global year setting automatically

### 4. Navigation Integration

- Added YearSelector to the main navigation bar
- Users can change the year from any page in the application

## Usage

### Setting the Year

```typescript
import { useYear } from '../contexts/YearContext';

function MyComponent() {
  const { setYear, currentYear } = useYear();
  
  const handleYearChange = async (newYear: string) => {
    const success = await setYear(newYear);
    if (success) {
      console.log('Year changed to:', newYear);
    }
  };
  
  return (
    <div>
      <p>Current year: {currentYear}</p>
      <button onClick={() => handleYearChange('2025')}>
        Switch to 2025
      </button>
    </div>
  );
}
```

### Using the Year Selector Component

```typescript
import YearSelector from '../components/YearSelector';

function MyComponent() {
  return (
    <div>
      <h2>Year Selection</h2>
      <YearSelector showLabel={true} />
    </div>
  );
}
```

### Making API Calls

```typescript
import { findAllIclrSubmissions } from '../Project/Home/home';

function MyComponent() {
  const fetchData = async () => {
    // No need to pass year parameter - uses global setting
    const data = await findAllIclrSubmissions();
    console.log(data);
  };
}
```

## Benefits

1. **Simplified API**: No need to pass year parameters to every function
2. **Consistent State**: All operations use the same year setting
3. **Better UX**: Users can change the year from any page
4. **Reduced Errors**: Eliminates the possibility of using different years in different parts of the application
5. **Easier Maintenance**: Centralized year management

## Migration Notes

- All existing functions that required year parameters have been updated
- The `findIclrByYear` function has been removed (use global year setting instead)
- The `/api/iclr/year/:year` route has been removed to avoid conflicts
- The year selector is now available in the navigation bar

## Available Years

The system currently supports:
- 2024 (default)
- 2025
- 2026

To add support for additional years, update the `models` object in `dao.js` and the `availableYears` array in `globalConfig.js`. 