import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectState } from '../store';
import * as home from './home';
import axios from "axios";
import { setIclr, setIclrName } from '../Reducers/iclrReducer';
import { setCurrentPreds, setRebuttalPreds, setNonRebuttalPreds } from '../Reducers/predictionReducer';
import { useYear } from '../../contexts/YearContext';
import { 
    adminStyles, 
    getDropdownButtonStyle, 
    getDropdownMenuStyle, 
    getTooltipArrowStyle 
} from './styles/adminStyles';
import './styles/admin.css';
import RatingDistributionChart from './components/RatingDistributionChart';
import PredictionErrors from './components/PredictionErrors';
import YearSelector from '../../components/YearSelector';
axios.defaults.withCredentials = true;

// Helper function to process papers data
function processPapersData(data: any[]) {
    // console.log(data[0]);
    return data.map((m: any) => {
        const {metareviews, ...bib} = m;
        const ratings = [];
        const confidences = [];
        const decisions = [];

        for (const o of metareviews) {
            if (o.values && o.values.rating) {
                const ratingValue = parseFloat(o.values.rating);
                if (!isNaN(ratingValue)) {
                    ratings.push(ratingValue);
                }
            }
            if (o.values && o.values.confidence) {
                const confidenceValue = parseFloat(o.values.confidence);
                if (!isNaN(confidenceValue)) {
                    confidences.push(confidenceValue);
                }
            }
            if (o.values && o.values.decision) {
                const decisionValue = o.values.decision.toLowerCase() === 'no' || o.values.decision.toLowerCase() === 'reject' ? 'Reject' : 'Accept';
                if (decisionValue) {
                    decisions.push(decisionValue);
                }
            }
        }
        
        const rating = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0;
        const confidence = confidences.length > 0 ? parseFloat((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)) : 0;

        return {
            ...bib,
            rating,
            confidence,
            ratings,
            confidences,
            decisions
        };
    });
}

function RatingHome() {
    const {currentIclrName} = useSelector((state: ProjectState) => state.iclrReducer)
    const {currentPreds, rebuttalPreds, nonRebuttalPreds} = useSelector((state: ProjectState) => state.predictionReducer)
    const dispatch = useDispatch();
    
    // Use global year context instead of local state
    const { currentYear, availableYears, setYear: setGlobalYear } = useYear();
    
    const [allPapers, setAllPapers] = useState<any[]>([]); // For plot data
    
    // Loading states
    const [isLoadingAllData, setIsLoadingAllData] = useState<boolean>(false);
    const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);

    const [currentPrompt, setCurrentPrompt] = useState<string>(home.BASIC_PROMPT);
    const [pub_rebuttal, setPubRebuttal] = useState<boolean>(false);
    const [field, setField] = useState<string>("rating");

    // New state for dropdown tooltip
    const [dropdownTooltipVisible, setDropdownTooltipVisible] = useState<boolean>(false);
    const [dropdownTooltipPosition, setDropdownTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
    const [dropdownTooltipContent, setDropdownTooltipContent] = useState<string>("");
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    
    // State for view toggle
    const [showPredictionErrors, setShowPredictionErrors] = useState<boolean>(false);
    
    // Memoize expensive computations
    const processedAllPapers = useMemo(() => processPapersData(allPapers), [allPapers]);
    
    // Memoize prediction lookup to avoid repeated filtering
    const predictionsMap = useMemo(() => {
        const map = new Map();
        if (currentPreds) {
            currentPreds.forEach(pred => {
                map.set(pred.paper_id, pred.prediction);
            });
        }
        return map;
    }, [currentPreds]);
    
    // Memoize rebuttal prediction lookup
    const rebuttalPredictionsMap = useMemo(() => {
        const map = new Map();
        if (rebuttalPreds) {
            rebuttalPreds.forEach(pred => {
                map.set(pred.paper_id, pred.prediction);
            });
        }
        return map;
    }, [rebuttalPreds]);
    
    // Memoize non-rebuttal prediction lookup
    const nonRebuttalPredictionsMap = useMemo(() => {
        const map = new Map();
        if (nonRebuttalPreds) {
            nonRebuttalPreds.forEach(pred => {
                map.set(pred.paper_id, pred.prediction);
            });
        }
        return map;
    }, [nonRebuttalPreds]);

    // Memoize prompt index to avoid recalculating on every render
    const currentPromptIndex = useMemo(() => {
        return home.PROMPT_CANDIDATES.findIndex(p => p === currentPrompt) + 1;
    }, [currentPrompt]);

    // Fetch all data for plot (no pagination) - ADD currentYear dependency
    const fetchAllData = useCallback(async () => {
        setIsLoadingAllData(true);
        try {
            const result = await home.findAllIclrSubmissionsWithPartialMetareviews();
            setAllPapers(result.data);
            console.log(result.data[0]);
            dispatch(setIclrName(result.name));
        } catch (error: any) {
            console.error('Error fetching all data:', error.response?.data || error);
        } finally {
            setIsLoadingAllData(false);
        }
    }, [dispatch, currentYear]);

    // Separate function for fetching predictions for all papers - ADD currentYear dependency
    const fetchPredictionsForAllPapers = useCallback(async (papers: any[], prompt: string, rebuttal: boolean) => {
        setIsLoadingPredictions(true);
        try {
            // Always fetch both rebuttal and non-rebuttal predictions
            const [rebuttalPredictions, nonRebuttalPredictions] = await Promise.all([
                home.getPredsByPromptAndRebuttal(prompt, 1), // With rebuttal
                home.getPredsByPromptAndRebuttal(prompt, 0)  // Without rebuttal
            ]);
            
            const processPredictions = (predictions: any[]) => predictions.map((p: any) => ({
                ...p,
                prediction: p.prediction.toLowerCase() === 'yes' || p.prediction.toLowerCase() === 'accept' ? "Accept" 
                    : p.prediction.toLowerCase() === 'no' || p.prediction.toLowerCase() === 'reject' ? "Reject" : "O"
            }));
            
            const processedRebuttalPreds = processPredictions(rebuttalPredictions);
            const processedNonRebuttalPreds = processPredictions(nonRebuttalPredictions);
            
            // Store both sets of predictions
            dispatch(setRebuttalPreds(processedRebuttalPreds));
            dispatch(setNonRebuttalPreds(processedNonRebuttalPreds));
            
            // Set current predictions based on the rebuttal toggle
            const currentPredictions = rebuttal ? processedRebuttalPreds : processedNonRebuttalPreds;
            dispatch(setCurrentPreds(currentPredictions));
            
            const acceptCount = currentPredictions.filter(p => p.prediction === 'Accept').length;
            const rejectCount = currentPredictions.filter(p => p.prediction === 'Reject').length;
            console.log(`Processed predictions - Accept: ${acceptCount}, Reject: ${rejectCount}`);
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setIsLoadingPredictions(false);
        }
    }, [dispatch, currentYear]);

    // Main data fetching effect - fetch all data for plot
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Effect to fetch predictions when all papers change or prompt changes
    useEffect(() => {
        if (allPapers.length > 0) {
            fetchPredictionsForAllPapers(allPapers, currentPrompt, pub_rebuttal);
        }
    }, [allPapers, currentPrompt, fetchPredictionsForAllPapers]);
    
    // Effect to switch between rebuttal and non-rebuttal predictions when toggle changes
    useEffect(() => {
        if (rebuttalPreds.length > 0 && nonRebuttalPreds.length > 0) {
            const currentPredictions = pub_rebuttal ? rebuttalPreds : nonRebuttalPreds;
            dispatch(setCurrentPreds(currentPredictions));
        }
    }, [pub_rebuttal, rebuttalPreds, nonRebuttalPreds, dispatch]);
    
    // Add click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (dropdownOpen && !target.closest('.dropdown-container') && !target.closest('.prompt-dropdown-menu')) {
                setDropdownOpen(false);
                setDropdownTooltipVisible(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);

    // Tooltip handlers for dropdown options
    const handleDropdownOptionMouseEnter = useCallback((event: React.MouseEvent, prompt: string) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownTooltipPosition({
            x: rect.right + 10, // Position to the right of the dropdown item
            y: rect.top + rect.height / 2
        });
        setDropdownTooltipContent(prompt);
        setDropdownTooltipVisible(true);
    }, []);

    const handleDropdownOptionMouseLeave = useCallback(() => {
        setDropdownTooltipVisible(false);
    }, []);

    // Memoize dropdown items to prevent unnecessary re-renders
    const dropdownItems = useMemo(() => {
        return home.PROMPT_CANDIDATES.map((prompt, index) => (
            <button
                key={index}
                className={`dropdown-item ${currentPrompt === prompt ? 'active' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    console.log('Dropdown item clicked:', prompt);
                    setCurrentPrompt(prompt);
                    setDropdownOpen(false);
                    setDropdownTooltipVisible(false);
                }}
                onMouseEnter={(e) => handleDropdownOptionMouseEnter(e, prompt)}
                onMouseLeave={handleDropdownOptionMouseLeave}
                style={currentPrompt === prompt ? adminStyles.dropdown.itemActive : adminStyles.dropdown.item}
            >
                Prompt {index + 1}
            </button>
        ));
    }, [currentPrompt, handleDropdownOptionMouseEnter, handleDropdownOptionMouseLeave]);

    return (
    <div style={adminStyles.container} className="p-4">
        <div className="d-flex gap-4 m-2">
            {/* Left Side Menu - Prompt Controls */}
            <div className="card border-0 shadow-lg" style={{
                ...adminStyles.table.card, 
                overflow: 'visible',
                width: '300px',
                minHeight: 'fit-content',
                // position: 'sticky',
                // top: '20px'
            }}>
                <div className="card-header border-0 py-3" style={adminStyles.table.header}>
                    <h6 className="mb-0">Prompt Controls</h6>
                </div>
                <div className="card-body p-4" style={{ overflow: 'visible' }}>
                    <div className="mb-3 mb-3" >
                        <YearSelector showLabel={true} />
                    </div>
                    <div className="d-flex flex-column gap-4">
                        <div className="w-100">
                            <div className="d-flex flex-column dropdown-container" style={{ position: 'relative', width: '100%' }}>
                                <label className="form-label mb-2" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
                                    Select Prompt:
                                </label>
                                <button 
                                    className="btn btn-sm btn-outline-secondary dropdown-toggle w-100" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Dropdown clicked, current state:', dropdownOpen);
                                        setDropdownOpen(!dropdownOpen);
                                    }}
                                    style={{...adminStyles.dropdown.button, width: '100%'}}
                                    disabled={isLoadingPredictions}
                                >
                                    {isLoadingPredictions ? (
                                        <>
                                            <div className="spinner-border spinner-border-sm me-2" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            Loading...
                                        </>
                                    ) : (
                                        `Prompt ${currentPromptIndex}`
                                    )}
                                </button>
                                
                                {dropdownOpen && (
                                    <div 
                                        className="dropdown-menu show prompt-dropdown-menu"
                                        style={{
                                            ...adminStyles.dropdown.menu,
                                            zIndex: 9999,
                                            display: 'block',
                                            maxHeight: 'none',
                                            height: 'auto',
                                            overflow: 'visible',
                                            width: '100%'
                                        }}
                                    >
                                        {home.PROMPT_CANDIDATES.map((prompt, index) => (
                                            <button
                                                key={index}
                                                className={`dropdown-item ${currentPrompt === prompt ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    console.log('Dropdown item clicked:', prompt);
                                                    setCurrentPrompt(prompt);
                                                    setDropdownOpen(false);
                                                    setDropdownTooltipVisible(false);
                                                }}
                                                onMouseEnter={(e) => handleDropdownOptionMouseEnter(e, prompt)}
                                                onMouseLeave={handleDropdownOptionMouseLeave}
                                                style={currentPrompt === prompt ? adminStyles.dropdown.itemActive : adminStyles.dropdown.item}
                                            >
                                                Prompt {index + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="mt-2 text-danger fst-italic" style={{ fontSize: '0.8rem' }}>
                                {dropdownTooltipContent ? dropdownTooltipContent : home.BASIC_PROMPT}
                            </div>

                        </div>

                    </div>
                </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-grow-1">
                {/* Rating Distribution Chart */}
                {!isLoadingAllData && processedAllPapers.length > 0 && (
                    <div className="card border-0 shadow-lg" style={{...adminStyles.table.card, maxHeight: 'none'}}>
                        <div className="card-header border-0 py-3" style={adminStyles.table.header}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mb-0">
                                    {showPredictionErrors ? 'Prediction Errors' : 'Prediction Distribution'}
                                </h6>
                                <button
                                    className="btn btn-sm"
                                    onClick={() => setShowPredictionErrors(!showPredictionErrors)}
                                    disabled={isLoadingPredictions}
                                    style={{
                                        background: showPredictionErrors 
                                            ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                                            : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '8px 16px',
                                        fontWeight: '600',
                                        fontSize: '0.85rem',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                        cursor: isLoadingPredictions ? 'not-allowed' : 'pointer',
                                        opacity: isLoadingPredictions ? 0.6 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoadingPredictions) {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoadingPredictions) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                                        }
                                    }}
                                >
                                    <i className={`fas ${showPredictionErrors ? 'fa-chart-bar' : 'fa-exclamation-triangle'} me-1`}></i>
                                    {showPredictionErrors ? 'Show Distribution' : 'Show Errors'}
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            {isLoadingPredictions ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                                    <div className="text-center">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                        <div className="mt-3 text-muted">Loading prediction data...</div>
                                    </div>
                                </div>
                            ) : showPredictionErrors ? (
                                <PredictionErrors 
                                    papers={processedAllPapers}
                                    rebuttalPredictionsMap={rebuttalPredictionsMap}
                                    nonRebuttalPredictionsMap={nonRebuttalPredictionsMap}
                                    currentPrompt={currentPrompt}
                                />
                            ) : (
                                <RatingDistributionChart 
                                    papers={processedAllPapers}
                                    currentPrompt={currentPrompt}
                                    predictionsMap={predictionsMap}
                                    rebuttalPredictionsMap={rebuttalPredictionsMap}
                                    nonRebuttalPredictionsMap={nonRebuttalPredictionsMap}
                                    showRebuttalComparison={pub_rebuttal && rebuttalPreds.length > 0 && nonRebuttalPreds.length > 0}
                                    field={field}
                                    pub_rebuttal={pub_rebuttal}
                                    setPubRebuttal={setPubRebuttal}
                                    fieldValue={field}
                                    setField={setField}
                                    isLoadingPredictions={isLoadingPredictions}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Tooltip for dropdown options */}
        {dropdownTooltipVisible && (
            <div 
                style={{
                    ...adminStyles.tooltip.dropdown,
                    left: dropdownTooltipPosition.x,
                    top: dropdownTooltipPosition.y,
                    transform: 'translateY(-50%)'
                }}
            >
                <div style={adminStyles.tooltip.title}>
                    Prompt Preview:
                </div>
                <div style={adminStyles.tooltip.content}>
                    {dropdownTooltipContent}
                </div>
                <div 
                    style={{
                        ...adminStyles.tooltip.arrow,
                        position: 'absolute',
                        top: '50%',
                        left: '-6px',
                        transform: 'translateY(-50%)',
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderRight: '6px solid #333'
                    }}
                />
            </div>
        )}
 
    </div>);
}
export default RatingHome;