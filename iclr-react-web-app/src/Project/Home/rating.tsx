import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectState } from '../store';
import * as home from './home';
import axios from "axios";
import { setIclr, setIclrName } from '../Reducers/iclrReducer';
import { setCurrentPreds, setRebuttalPreds, setNonRebuttalPreds } from '../Reducers/predictionReducer';
import { useYear, useYearDependentFetch, useYearDependentFetchSimple } from '../../contexts/YearContext';
import { adminStyles } from './styles/adminStyles';
import { ratingStyles } from './styles/ratingStyles';
import './styles/admin.css';
import RatingDistributionChart from './components/DistributionChart';
import PredictionErrors from './components/PredictionErrors';
import PromptDropdown from './components/PromptDropdown';
import ConfirmationModal from './components/ConfirmationModal';
import * as util from './utility';

axios.defaults.withCredentials = true;

// Helper function to process papers data
function processPapersData(data: any[]) {
    // console.log(data[0]);
    return data.map((m: any) => {
        const {metareviews, ...bib} = m;
        const ratings = [];
        const confidences = [];
        const soundnesses = [];
        const presentations = [];
        const contributions = [];
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
            if (o.values && o.values.soundness) {
                const soundnessValue = parseFloat(o.values.soundness);
                if (!isNaN(soundnessValue)) {
                    soundnesses.push(soundnessValue);
                }
            }
            if (o.values && o.values.presentation) {
                const presentationValue = parseFloat(o.values.presentation);
                if (!isNaN(presentationValue)) {
                    presentations.push(presentationValue);
                }
            }
            if (o.values && o.values.contribution) {
                const contributionValue = parseFloat(o.values.contribution);
                if (!isNaN(contributionValue)) {
                    contributions.push(contributionValue);
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
        const soundness = soundnesses.length > 0 ? parseFloat((soundnesses.reduce((a, b) => a + b, 0) / soundnesses.length).toFixed(2)) : 0;
        const presentation = presentations.length > 0 ? parseFloat((presentations.reduce((a, b) => a + b, 0) / presentations.length).toFixed(2)) : 0;
        const contribution = contributions.length > 0 ? parseFloat((contributions.reduce((a, b) => a + b, 0) / contributions.length).toFixed(2)) : 0;

        return {
            ...bib,
            rating,
            confidence,
            soundness,
            presentation,
            contribution,
            ratings,
            confidences,
            soundnesses,
            presentations,
            contributions,
            decisions
        };
    });
}


function RatingHome() {
    const {currentIclrName} = useSelector((state: ProjectState) => state.iclrReducer)
    const {currentPreds, rebuttalPreds, nonRebuttalPreds} = useSelector((state: ProjectState) => state.predictionReducer)
    const dispatch = useDispatch();
    
    
    // Only destructure currentYear to avoid unnecessary re-renders
    const { currentYear } = useYear();
    
    const [allPapers, setAllPapers] = useState<any[]>([]); // For plot data
    
    // Loading states
    const [isLoadingAllData, setIsLoadingAllData] = useState<boolean>(false);
    const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);
    
    const [currentPrompt, setCurrentPrompt] = useState<string>(home.BASIC_PROMPT);
    const [pub_rebuttal, setPubRebuttal] = useState<boolean>(false);
    const [field, setField] = useState<string>("rating");
    const [promt_n, setPromt_n] = useState<string>(currentPrompt);
    const [size, setSize] = useState<string>("200");
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);

    // State for view toggle
    const [showPredictionErrors, setShowPredictionErrors] = useState<boolean>(false);
    const [showMismatch, setShowMismatch] = useState<boolean>(false);
    
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

    // Optimized data fetching with caching and error handling
    const fetchAllData = useYearDependentFetchSimple(async () => {
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
    });

    // Use custom hook for year-dependent prediction fetching
    const fetchPredictionsForAllPapers = useYearDependentFetch(async (prompt: string, rebuttal: boolean) => {
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
    }, [currentPrompt, pub_rebuttal]);

    // Main data fetching effect - fetch all data for plot
    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    // Effect to fetch predictions when all papers change or prompt changes
    useEffect(() => {
        if (allPapers.length > 0) {
            fetchPredictionsForAllPapers(currentPrompt, pub_rebuttal);
        }
    }, [allPapers, currentPrompt, fetchPredictionsForAllPapers]);
    
    // Effect to switch between rebuttal and non-rebuttal predictions when toggle changes
    useEffect(() => {
        if (rebuttalPreds.length > 0 && nonRebuttalPreds.length > 0) {
            const currentPredictions = pub_rebuttal ? rebuttalPreds : nonRebuttalPreds;
            dispatch(setCurrentPreds(currentPredictions));
        }
    }, [pub_rebuttal, rebuttalPreds, nonRebuttalPreds, dispatch]);
    
    return (
    <div style={{...adminStyles.container, ...ratingStyles.container}} className="p-2 mt-4">
        <div className="d-flex gap-4 m-0">
            {/* Left Side Menu - Prompt Controls */}
            <div className="card border-0 shadow-lg" style={{
                ...adminStyles.table.card, 
                ...ratingStyles.leftMenu
            }}>
                <div className="card-header border-0 py-3" style={{
                    ...adminStyles.table.header,
                    ...ratingStyles.leftMenuHeader
                }}>
                    <h6 className="mb-0">Prompt Controls</h6>
                </div>
                <div className="card-body p-4" style={ratingStyles.leftMenuBody}>
                    <div className="d-flex flex-column gap-4">
                        <div className="w-100">
                            <div className="d-flex flex-column" style={ratingStyles.formControlContainer}>
                                 <PromptDropdown
                                    currentPrompt={currentPrompt}
                                    onPromptChange={(prompt: string) => {
                                        setCurrentPrompt(prompt);
                                        setPromt_n(prompt);
                                    }}
                                    isLoading={isLoadingPredictions}
                                    showTooltip={true}
                                    tooltipPosition="right"
                                    buttonStyle={{
                                        color: 'black',
                                        padding: '6px 12px',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        borderRadius: '16px',
                                        transition: 'all 0.2s ease',
                                        minWidth: '100px'
                                    }}
                                />
                            </div>
                            <div className="mt-3">
                                <textarea
                                    className="form-control prompt-textarea"
                                    value={promt_n || currentPrompt}
                                    onChange={(e) => setPromt_n(e.target.value)}
                                    placeholder={currentPrompt}
                                    style={ratingStyles.promptTextarea}
                                    rows={20}
                                />
                                {/* <div className="mt-1 text-muted" style={ratingStyles.promptInfo}>
                                    <small>Edit the prompt above to customize predictions</small>
                                </div> */}
                            </div>
                            <div className="d-flex align-items-center mt-3" style={adminStyles.prediction.container}>
                                <button 
                                    className="btn btn-sm rounded-pill btn-primary" 
                                    onClick={() => setShowConfirmationModal(true)}
                                    style={{
                                        backgroundColor: '#3b82f6',
                                        borderColor: '#3b82f6',
                                        color: 'white',
                                        fontWeight: '500',
                                        padding: '6px 16px',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Prompt
                                </button>
                                <div className="ms-2 d-flex align-items-center gap-1">
                                    <label 
                                        htmlFor="size-input" 
                                        className="form-label ms-3"
                                        style={{
                                            fontSize: '0.875rem',
                                            fontWeight: '500',
                                            color: '#6b7280'
                                        }}
                                    >
                                        Samples
                                    </label>
                                    <input 
                                        id="size-input"
                                        type="text" 
                                        value={size} 
                                        onChange={(e) => setSize(e.target.value)}
                                        className="form-control form-control-sm"
                                        style={{ 
                                            width: '80px',
                                            fontSize: '0.875rem'
                                        }}
                                        placeholder="200"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content Area */}
            <div className="flex-grow-1" style={ratingStyles.mainContent}>
                {/* Loading state for paper data */}
                {isLoadingAllData && (
                    <div className="card border-0 shadow-lg" style={adminStyles.table.card}>
                        <div className="card-header border-0 py-3" style={adminStyles.table.header}>
                            <h6 className="mb-0">Loading Paper Data</h6>
                        </div>
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-center align-items-center" style={ratingStyles.loadingContainer}>
                                <div className="text-center">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <div className="mt-3 text-muted">Loading paper data...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Rating Distribution Chart */}
                {!isLoadingAllData && processedAllPapers.length > 0 && (
                    <div className="card border-0 shadow-lg" style={adminStyles.table.card}>
                        <div className="card-header border-0 py-3" style={adminStyles.table.header}>
                            <div className="d-flex justify-content-between align-items-center">
                                
                                <h6 className="mb-0">
                                    {showPredictionErrors ? 'Prediction Analysis' : 'Prediction Distribution'}
                                </h6>
                                <button
                                    className="btn btn-sm"
                                    onClick={() => setShowPredictionErrors(!showPredictionErrors)}
                                    disabled={isLoadingPredictions}
                                    style={ratingStyles.getToggleButtonStyle(showPredictionErrors, isLoadingPredictions)}
                                    onMouseEnter={(e) => {
                                        if (!isLoadingPredictions) {
                                            Object.assign(e.currentTarget.style, ratingStyles.getButtonHoverStyle(isLoadingPredictions));
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoadingPredictions) {
                                            Object.assign(e.currentTarget.style, ratingStyles.getButtonLeaveStyle(isLoadingPredictions));
                                        }
                                    }}
                                >
                                    <i className={`fas ${showPredictionErrors ? 'fa-chart-bar' : 'fa-exclamation-triangle'} me-1`}></i>
                                    {showPredictionErrors ? 'Distribution' : 'Analysis'}
                                </button>
                            </div>
                        </div>
                        <div className="card-body p-4">
                            {isLoadingPredictions ? (
                                <div className="d-flex justify-content-center align-items-center" style={ratingStyles.loadingContainer}>
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
                                    showMismatch={showMismatch}
                                    setShowMismatch={setShowMismatch}
                                />
                            ) : (
                                <RatingDistributionChart 
                                    papers={processedAllPapers}
                                    currentPrompt={currentPrompt}
                                    predictionsMap={predictionsMap}
                                    rebuttalPredictionsMap={rebuttalPredictionsMap}
                                    nonRebuttalPredictionsMap={nonRebuttalPredictionsMap}
                                    // showRebuttalComparison={pub_rebuttal && rebuttalPreds.length > 0 && nonRebuttalPreds.length > 0}
                                    field={field}
                                    // pub_rebuttal={pub_rebuttal}
                                    // setPubRebuttal={setPubRebuttal}
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
        {showConfirmationModal && (
            <ConfirmationModal
                showConfirmationModal={true}
                openModalPaper={{ title: "Custom Prompt Template", url: null }}
                confirmationPrompt={promt_n}
                setConfirmationPrompt={setPromt_n}
                user_rebuttal={false}
                setUserRebuttal={() => {}}
                setShowConfirmationModal={setShowConfirmationModal}
                onConfirm={() => {
                    console.log("Prompt template submitted:", promt_n);
                    setShowConfirmationModal(false);
                }}
            />
        )}

    </div>);
}
export default RatingHome;