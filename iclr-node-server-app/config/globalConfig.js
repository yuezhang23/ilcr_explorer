// Global configuration for the application
let currentYear = '2024'; // Default year

export const setCurrentYear = (year) => {
    if (['2024', '2025', '2026'].includes(year)) {
        currentYear = year;
        return true;
    }
    return false;
};

export const getCurrentYear = () => {
    return currentYear;
};

export const getAvailableYears = () => {
    return ['2024', '2025', '2026'];
}; 