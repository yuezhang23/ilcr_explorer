# Admin Component Styles

This directory contains all the styles for the Admin component, organized to improve maintainability and reusability.

## File Structure

- `adminStyles.ts` - TypeScript object containing all inline styles organized by component sections
- `admin.css` - CSS file for additional styles and utility classes
- `index.ts` - Export file for easier importing
- `README.md` - This documentation file

## Style Organization

### adminStyles.ts

The styles are organized into logical sections:

- **container** - Main container styles
- **pagination** - Pagination button and input styles
- **search** - Search input and icon styles
- **table** - Table header, body, and sort button styles
- **row** - Row background and hover styles
- **badge** - Badge styles for conference and decision
- **rating** - Rating color styles (high, medium, low)
- **title** - Title link and text styles
- **button** - Button styles for abstract, authors, and prediction
- **abstract** - Abstract container styles
- **authors** - Authors list and item styles
- **individualRating** - Individual rating item styles
- **confidence** - Confidence color styles
- **decisionColors** - Decision badge color schemes
- **predictionColors** - Prediction button color schemes
- **emptyState** - Empty state container and icon styles
- **modal** - Modal overlay, container, and form styles

### Helper Functions

The file also includes helper functions for dynamic styling:

- `getRatingColor(rating)` - Returns appropriate color based on rating value
- `getConfidenceColor(confidence)` - Returns appropriate color based on confidence value
- `getDecisionColors(decision)` - Returns color scheme based on decision type
- `getPredictionColors(prediction)` - Returns color scheme based on prediction content
- `getIndividualRatingColor(rating)` - Returns color for individual rating items
- `getRowBackground(index, isExpanded)` - Returns row background style
- `getPaginationButtonStyle(isDisabled)` - Returns pagination button style

### admin.css

Contains CSS classes for:
- Hover effects
- Focus states
- Utility classes
- Responsive adjustments

## Usage

### Importing Styles

```typescript
import { 
    adminStyles, 
    getRatingColor, 
    getConfidenceColor,
    // ... other helpers
} from './styles/adminStyles';
import './styles/admin.css';
```

### Using Styles

```typescript
// Direct style object
<div style={adminStyles.container}>

// Dynamic styles with helper functions
<div style={getRatingColor(rating)}>

// Combining styles
<span style={{ ...getDecisionColors(decision), ...adminStyles.badge.decision }}>
```

## Benefits

1. **Maintainability** - All styles are centralized and organized
2. **Reusability** - Helper functions can be reused across components
3. **Type Safety** - TypeScript provides type checking for style objects
4. **Consistency** - Centralized color schemes and spacing
5. **Performance** - Styles are defined once and reused
6. **Readability** - Component code is cleaner without inline styles

## Color Scheme

The component uses a consistent color scheme:

- **Green** (`#059669`) - High ratings, accept decisions, positive predictions
- **Orange** (`#d97706`) - Medium ratings, confidence
- **Red** (`#dc2626`) - Low ratings, reject decisions, negative predictions
- **Blue** (`#3730a3`) - Conference badges, neutral predictions
- **Gray** (`#6b7280`) - Text, neutral states
- **White/Gray** (`#ffffff`, `#f9fafb`) - Row backgrounds 