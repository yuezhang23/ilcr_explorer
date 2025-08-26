import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectState } from '../store';
import * as home from './home';
import * as util from './utility';
import axios from "axios";
import { FaChevronDown, FaChevronUp, FaEye, FaEyeSlash } from 'react-icons/fa6';
import { setIclr, setIclrName } from '../Reducers/iclrReducer';
import { updatePrediction, setCurrentPreds } from '../Reducers/predictionReducer';
import { useYear } from '../../contexts/YearContext';
import { 
    adminStyles, 
    getRatingColor, 
    getDecisionColors, 
    getPredictionColors, 
    getIndividualRatingColor, 
    getRowBackground, 
    getPaginationButtonStyle,
} from './styles/adminStyles';
import './styles/admin.css';
import Leaderboard from './components/Leaderboard';
import PromptDropdown from './components/PromptDropdown';
import RebuttalToggle from './components/RebuttalToggle';
import PromptInputModal from './components/PromptInputModal';
import ConfirmationModal from './components/ConfirmationModal';

axios.defaults.withCredentials = true;

// Optimized helper function with early returns and reduced iterations
function processPapersData(data: any[]) {
    if (!data || data.length === 0) return [];
    
    return data.map((m: any) => {
        const { metareviews, ...bib } = m;
        
        if (!metareviews || metareviews.length === 0) {
            return { ...bib, rating: 0, confidence: 0, ratings: [], confidences: [] };
        }

        let totalRating = 0;
        let totalConfidence = 0;
        let validRatings = 0;
        let validConfidences = 0;
        const ratings: number[] = [];
        const confidences: number[] = [];

        // Single loop for better performance
        for (const o of metareviews) {
            const values = o.values;
            if (values) {
                if (values.rating) {
                    const ratingValue = parseFloat(values.rating);
                    if (!isNaN(ratingValue)) {
                        ratings.push(ratingValue);
                        totalRating += ratingValue;
                        validRatings++;
                    }
                }
                if (values.confidence) {
                    const confidenceValue = parseFloat(values.confidence);
                    if (!isNaN(confidenceValue)) {
                        confidences.push(confidenceValue);
                        totalConfidence += confidenceValue;
                        validConfidences++;
                    }
                }
            }
        }
        
        const rating = validRatings > 0 ? Math.round((totalRating / validRatings) * 100) / 100 : 0;
        const confidence = validConfidences > 0 ? Math.round((totalConfidence / validConfidences) * 100) / 100 : 0;

        return {
            ...bib,
            rating,
            confidence,
            ratings,
            confidences
        };
    });
}

// Optimized Pagination Component with reduced re-renders
const Pagination = React.memo(({ 
    currentPage, 
    totalPages, 
    totalRecords, 
    pageInput, 
    setPageInput, 
    goToNextPage, 
    goToPreviousPage, 
    setCurrentPage,
    searchTerm,
    setSearchTerm
}: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageInput: string;
    setPageInput: (value: string) => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    setCurrentPage: (page: number) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}) => {
    const clearButtonStyle = useMemo(() => ({
        borderRadius: '8px',
        padding: '6px 12px',
        color: '#dc2626',
        backgroundColor: '#fecaca',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)',
        fontSize: '0.9rem',
        minWidth: '80px',
        border: 'none'
    }), []);

    const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    }, [setPageInput]);

    const handlePageInputBlur = useCallback(() => {
        const pageNum = Math.max(1, Math.min(parseInt(pageInput, 10) || 1, totalPages));
        setCurrentPage(pageNum);
    }, [pageInput, totalPages, setCurrentPage]);

    const handlePageInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const pageNum = Math.max(1, Math.min(parseInt(pageInput, 10) || 1, totalPages));
            setCurrentPage(pageNum);
        }
    }, [pageInput, totalPages, setCurrentPage]);

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
    }, [setSearchTerm]);

    const handlePreviousMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
        }
    }, [currentPage]);

    const handlePreviousMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (currentPage !== 1) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
        }
    }, [currentPage]);

    const handleNextMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
        }
    }, [currentPage, totalPages]);

    const handleNextMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (currentPage !== totalPages) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
        }
    }, [currentPage, totalPages]);

    const handleClearMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = '#fca5a5';
        e.currentTarget.style.color = '#b91c1c';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.2)';
    }, []);

    const handleClearMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.backgroundColor = '#fecaca';
        e.currentTarget.style.color = '#dc2626';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.1)';
    }, []);

    return (
        <div className="d-flex align-items-center">
            {searchTerm && (
                <button 
                    onClick={handleClearSearch}
                    className="btn me-3 rounded-pill"
                    style={clearButtonStyle}
                    onMouseEnter={handleClearMouseEnter}
                    onMouseLeave={handleClearMouseLeave}
                >
                    Clear
                </button>
            )}
            {totalRecords > 0 && (
                <>
                    <button 
                        onClick={goToPreviousPage} 
                        disabled={currentPage === 1}
                        className="btn me-3 rounded-pill"
                        style={getPaginationButtonStyle(currentPage === 1)}
                        onMouseEnter={handlePreviousMouseEnter}
                        onMouseLeave={handlePreviousMouseLeave}
                    >
                        ← Previous
                    </button>
                    <div className="text-black text-center" style={adminStyles.pagination.pageInfo}>
                        <div className="fw-bold">
                            Page 
                            <input
                                type="number"
                                min={1}
                                max={totalPages}
                                value={pageInput}
                                onChange={handlePageInputChange}
                                onBlur={handlePageInputBlur}
                                onKeyDown={handlePageInputKeyDown}
                                style={adminStyles.pagination.pageInput}
                            />
                            of {totalPages}
                        </div>
                        <div style={adminStyles.pagination.totalRecords}>
                            {totalRecords} total records
                        </div>
                    </div>
                    <button 
                        onClick={goToNextPage} 
                        disabled={currentPage === totalPages}
                        className="btn ms-3 rounded-pill"
                        style={getPaginationButtonStyle(currentPage === totalPages)}
                        onMouseEnter={handleNextMouseEnter}
                        onMouseLeave={handleNextMouseLeave}
                    >
                        Next →
                    </button>
                </>
            )}
        </div>
    );
});

// Optimized Search Component
const SearchBar = React.memo(({ 
    searchTerm, 
    setSearchTerm 
}: {
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}) => {
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, [setSearchTerm]);

    const handleSearchFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        Object.assign(e.target.style, adminStyles.search.inputFocused);
    }, []);

    const handleSearchBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        Object.assign(e.target.style, adminStyles.search.inputBlurred);
    }, []);

    return (
        <div className="d-flex flex-column">
            <div className="d-flex align-items-center">
                <div className="position-relative">
                    <i className="fas fa-search position-absolute" 
                       style={adminStyles.search.icon}></i>
                    <input
                        type="text"
                        placeholder="Search papers by title, author, or abstract..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="form-control rounded-pill"
                        style={adminStyles.search.input}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                    />
                </div>
            </div>
        </div>
    );
});

// Optimized Paper Row Component with better memoization
const PaperRow = React.memo(({ 
    paper, 
    index, 
    predictionsMap, 
    expandedAbstracts, 
    expandedAuthors, 
    toggleAbstract, 
    toggleAuthors, 
    setOpenModalPaper, 
    setSearchTerm,
    currentPrompt 
}: {
    paper: any;
    index: number;
    predictionsMap: Map<string, string>;
    expandedAbstracts: Set<number>;
    expandedAuthors: Set<number>;
    toggleAbstract: (index: number) => void;
    toggleAuthors: (index: number) => void;
    setOpenModalPaper: (paper: any) => void;
    setSearchTerm: (value: string) => void;
    currentPrompt: string;
}) => {
    const isAbstractExpanded = expandedAbstracts.has(index);
    const isAuthorsExpanded = expandedAuthors.has(index);
    const isExpanded = isAbstractExpanded || isAuthorsExpanded;
    
    // Memoize expensive computations
    const rowBackgroundStyle = useMemo(() => 
        getRowBackground(index, isExpanded), [index, isExpanded]);
    
    const prediction = useMemo(() => 
        predictionsMap.get(paper._id), [predictionsMap, paper._id]);
    
    const buttonText = useMemo(() => 
        prediction || <span>O</span>, [prediction]);
    
    const predictionButtonStyle = useMemo(() => 
        ({ ...getPredictionColors(prediction), ...adminStyles.button.prediction }), [prediction]);

    // Memoize author button styles
    const authorButtonStyle = useMemo(() => ({
        color: 'inherit',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        textAlign: 'center' as const,
        width: '100%'
    }), []);

    const handleRowMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        Object.assign(e.currentTarget.style, adminStyles.row.hover);
    }, []);

    const handleRowMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.currentTarget.style.backgroundColor = rowBackgroundStyle.backgroundColor || '#ffffff';
        e.currentTarget.style.transform = 'translateX(0)';
    }, [rowBackgroundStyle.backgroundColor]);

    const handleTitleMouseEnter = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.color = adminStyles.title.linkHover.color;
    }, []);

    const handleTitleMouseLeave = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
        e.currentTarget.style.color = adminStyles.title.link.color;
    }, []);

    const handleAbstractButtonMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isAbstractExpanded) {
            e.currentTarget.style.backgroundColor = adminStyles.button.abstractHover.backgroundColor;
        }
    }, [isAbstractExpanded]);

    const handleAbstractButtonMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isAbstractExpanded) {
            e.currentTarget.style.backgroundColor = adminStyles.button.abstract.backgroundColor;
        }
    }, [isAbstractExpanded]);

    const handleAuthorsButtonMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isAuthorsExpanded) {
            e.currentTarget.style.backgroundColor = adminStyles.button.authorsHover.backgroundColor;
        }
    }, [isAuthorsExpanded]);

    const handleAuthorsButtonMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isAuthorsExpanded) {
            e.currentTarget.style.backgroundColor = adminStyles.button.authors.backgroundColor;
        }
    }, [isAuthorsExpanded]);

    const handlePredictionClick = useCallback(() => {
        setOpenModalPaper(paper);
    }, [paper, setOpenModalPaper]);

    const handleAuthorClick = useCallback((author: string) => {
        setSearchTerm(author);
    }, [setSearchTerm]);

    const handleToggleAbstract = useCallback(() => {
        toggleAbstract(index);
    }, [toggleAbstract, index]);

    const handleToggleAuthors = useCallback(() => {
        toggleAuthors(index);
    }, [toggleAuthors, index]);

    // Optimized mouse event handlers for author buttons
    const handleAuthorMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.textDecoration = 'underline';
        e.currentTarget.style.color = '#007bff';
    }, []);

    const handleAuthorMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.style.textDecoration = 'none';
        e.currentTarget.style.color = 'inherit';
    }, []);

    return (
        <div 
            style={rowBackgroundStyle}
            onMouseEnter={handleRowMouseEnter}
            onMouseLeave={handleRowMouseLeave}
        >
            <div className="row align-items-center text-center my-4">
                <div className="col-3">
                    <div className='text-center d-block'>
                        {paper.url ? (
                            <a href={paper.url} target="_blank" rel="noopener noreferrer" 
                               className="text-decoration-none fw-bold"
                               style={adminStyles.title.link}
                               onMouseEnter={handleTitleMouseEnter}
                               onMouseLeave={handleTitleMouseLeave}>
                                {paper.title}
                            </a>
                        ) : (
                            <strong className='fs-6' style={adminStyles.title.text}>{paper.title}</strong>
                        )}
                    </div>
                    <div className="text-center">
                        <button 
                            onClick={handleToggleAbstract}
                            className="btn btn-sm rounded-pill"
                            style={isAbstractExpanded ? adminStyles.button.abstractExpanded : adminStyles.button.abstract}
                            onMouseEnter={handleAbstractButtonMouseEnter}
                            onMouseLeave={handleAbstractButtonMouseLeave}
                        >
                            {isAbstractExpanded ? (
                                <>
                                    <span><FaEyeSlash /></span> Hide Abstract
                                </>
                            ) : (
                                <>
                                    <span><FaEye /></span> Show Abstract
                                </>
                            )}
                        </button>
                    </div>
                    {isAbstractExpanded && (
                        <div 
                            className="mt-3 p-4 rounded-3"
                            style={adminStyles.abstract.container}
                        >
                            {paper.abstract}
                        </div>
                    )}
                </div>
                <div className='col-2'>
                    <div className='w-100'>
                        <ul className='list-unstyled' style={isAuthorsExpanded ? adminStyles.authors.listExpanded : adminStyles.authors.list}>
                            {paper.authors.map((author: string, idx: number) => (
                                <li key={idx} style={adminStyles.authors.item}>
                                    <button
                                        onClick={() => handleAuthorClick(author)}
                                        className="btn btn-link p-0 text-decoration-none"
                                        style={authorButtonStyle}
                                        onMouseEnter={handleAuthorMouseEnter}
                                        onMouseLeave={handleAuthorMouseLeave}
                                    >
                                        {author}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        {paper.authors.length > 5 && (
                            <button 
                                onClick={handleToggleAuthors}
                                className="btn btn-sm rounded-pill mt-2"
                                style={isAuthorsExpanded ? adminStyles.button.authorsExpanded : adminStyles.button.authors}
                                onMouseEnter={handleAuthorsButtonMouseEnter}
                                onMouseLeave={handleAuthorsButtonMouseLeave}
                            >
                                {isAuthorsExpanded ? (
                                    <>
                                        <span><FaChevronUp /></span> Show Less
                                    </>
                                ) : (
                                    <>
                                        <span><FaChevronDown /></span> Show All ({paper.authors.length})
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
                <div className="col-1">
                    <div className="fw-bold" style={getRatingColor(paper.rating)}>
                        {paper.rating}
                    </div>
                </div>
                <div className='col-1'>
                    <div className='w-100'>
                        <ul className='list-unstyled'>
                            {paper.ratings.map((rating: number, idx: number) => (
                                <li key={idx} style={getIndividualRatingColor(rating)}>
                                    {rating}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className='col-1'>
                    <div className='w-100'>
                        <ul className='list-unstyled'>
                            {paper.confidences.map((confidence: number, idx: number) => (
                                <li key={idx} style={getIndividualRatingColor(confidence)}>
                                    {confidence}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className='col-2'>
                    <span className="badge rounded-pill px-3" 
                          style={{ ...getDecisionColors(paper.decision), ...adminStyles.badge.decision }}>
                        {paper.decision}
                    </span>
                </div>
                <div className='col-2'>
                    <div className="text-muted" style={adminStyles.prediction.container}>
                        <button 
                            className="btn btn-sm rounded-pill" 
                            style={predictionButtonStyle}
                            onClick={handlePredictionClick}
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});


// Main component with optimized state management and data fetching
// Optimization Strategy:
// 1. Parallel data fetching - start fetching immediately when year changes
// 2. Combined state updates - reduce re-renders by batching state changes
// 3. Skip debouncing for year changes - immediate UI response
// 4. Optimistic loading states - show feedback before data arrives
function AdminHome() {

    const { currentPreds } = useSelector((state: ProjectState) => state.predictionReducer);
    const dispatch = useDispatch();
    const { currentYear, loading: yearLoading } = useYear();

    // Consolidated state management
    const [state, setState] = useState({
        bib: [] as any[],
        currentPage: 1,
        pageInput: '1',
        totalRecords: 0,
        searchTerm: '',
        isLoadingData: false,
        isLoadingPredictions: false,
        userPrompt: '',
        currentPrompt: home.BASIC_PROMPT,
        openModalPaper: null as any | null,
        showConfirmationModal: false,
        confirmationPrompt: '',
        user_rebuttal: false,
        pub_rebuttal: false,
        showPrompt: false,
        expandedAbstracts: new Set<number>(),
        expandedAuthors: new Set<number>(),
        isYearChanging: false
    });

    const recordsPerPage = 20;
    const searchTimeoutRef = useRef<NodeJS.Timeout | number>();

    // Memoized computations
    const processedBib = useMemo(() => processPapersData(state.bib), [state.bib]);
    const totalPages = useMemo(() => Math.ceil(state.totalRecords / recordsPerPage), [state.totalRecords]);
    
    const predictionsMap = useMemo(() => {
        const map = new Map();
        if (currentPreds) {
            currentPreds.forEach(pred => {
                map.set(pred.paper_id, pred.prediction);
            });
        }
        return map;
    }, [currentPreds]);

    // Optimized data fetching with debouncing
    const fetchPaginatedData = useCallback(async () => {
        setState(prev => ({ ...prev, isLoadingData: true }));
        try {
            const skip = (state.currentPage - 1) * recordsPerPage;
            const result = await home.findPaginatedIclrSubmissions(recordsPerPage, skip, state.searchTerm);
            setState(prev => ({
                ...prev,
                bib: result.data,
                totalRecords: result.totalCount,
                isLoadingData: false,
                isYearChanging: false
            }));
            dispatch(setIclr(result.data));
            dispatch(setIclrName(result.name));
        } catch (error: any) {
            console.error('Error fetching paginated data:', error.response?.data || error);
            setState(prev => ({ ...prev, isLoadingData: false, isYearChanging: false }));
        }
    }, [state.currentPage, state.searchTerm, dispatch, currentYear]);

    // Optimized predictions fetching
    const fetchPredictionsForCurrentPage = useCallback(async (papers: any[], prompt: string, rebuttal: boolean) => {
        if (papers.length === 0) return;
        
        setState(prev => ({ ...prev, isLoadingPredictions: true }));
        try {
            const paperIds = papers.map((p: any) => p._id);
            const newPredictions = await home.getPredsByPaperIdsAndPromptAndRebuttal(paperIds, prompt, rebuttal ? 1 : 0);
            const processedPredictions = newPredictions.map((p: any) => ({
                ...p,
                prediction: p.prediction.toLowerCase() === 'yes' || p.prediction.toLowerCase() === 'accept' ? "Accept" 
                    : p.prediction.toLowerCase() === 'no' || p.prediction.toLowerCase() === 'reject' ? "Reject" : "O"
            }));
            dispatch(setCurrentPreds(processedPredictions));
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setState(prev => ({ ...prev, isLoadingPredictions: false }));
        }
    }, [dispatch]);

    // Debounced search effect with optimization for year changes
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        
        // Skip debounce if search term is empty (during year change)
        if (state.searchTerm === '') {
            setState(prev => ({ 
                ...prev, 
                currentPage: 1,
                expandedAbstracts: new Set(),
                expandedAuthors: new Set()
            }));
        } else {
            searchTimeoutRef.current = setTimeout(() => {
                setState(prev => ({ 
                    ...prev, 
                    currentPage: 1,
                    expandedAbstracts: new Set(),
                    expandedAuthors: new Set()
                }));
            }, 300);
        }

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [state.searchTerm]);

    // Main data fetching effect - start immediately when year changes
    useEffect(() => {
        if (currentYear) {
            fetchPaginatedData();
        }
    }, [currentYear, fetchPaginatedData]);

    // Secondary effect for year loading state
    useEffect(() => {
        if (!yearLoading && currentYear && state.bib.length === 0) {
            // Only fetch if we don't have data yet
            fetchPaginatedData();
        }
    }, [yearLoading, currentYear, state.bib.length, fetchPaginatedData]);

    // Reset to first page and clear UI state when year changes - combined state update
    useEffect(() => {
        setState(prev => ({ 
            ...prev, 
            currentPage: 1, 
            pageInput: '1',
            searchTerm: '',
            bib: [],
            totalRecords: 0,
            expandedAbstracts: new Set(),
            expandedAuthors: new Set(),
            isYearChanging: true
        }));
    }, [currentYear]);

    // Predictions fetching effect - run in parallel with data fetching
    useEffect(() => {
        if (state.bib.length > 0) {
            // Fetch predictions immediately when data is available
            fetchPredictionsForCurrentPage(state.bib, state.currentPrompt, state.pub_rebuttal);
        }
    }, [state.bib, state.currentPrompt, state.pub_rebuttal, fetchPredictionsForCurrentPage]);



    // Optimized event handlers
    const handlePrompting = useCallback(async (url: string, id: string, rebuttal: number) => {
        const promptToUse = state.userPrompt || home.BASIC_PROMPT;
        try {
            const response = await home.promptSubmissionByUrl(url, state.confirmationPrompt, rebuttal);
            const prediction = response.toLowerCase() === 'yes' || response.toLowerCase() === 'accept' ? "Accept" : "Reject";
            dispatch(updatePrediction({ paper_id: id, prompt: promptToUse, prediction }));
            setState(prev => ({
                ...prev,
                openModalPaper: null,
                showConfirmationModal: false,
                user_rebuttal: false
            }));
        } catch (error) {
            console.error(error);
        }
    }, [state.userPrompt, state.confirmationPrompt, dispatch]);

    const goToNextPage = useCallback(() => {
        if (state.currentPage < totalPages) {
            setState(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
        }
    }, [state.currentPage, totalPages]);

    const goToPreviousPage = useCallback(() => {
        if (state.currentPage > 1) {
            setState(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
        }
    }, [state.currentPage]);

    // Generic setter function to reduce code duplication
    const setStateField = useCallback((field: string, value: any) => {
        setState(prev => ({ ...prev, [field]: value }));
    }, []);

    // Specific setters for commonly used fields
    const setCurrentPage = useCallback((page: number) => {
        setStateField('currentPage', page);
    }, [setStateField]);

    const setSearchTerm = useCallback((value: string) => {
        setStateField('searchTerm', value);
    }, [setStateField]);

    const setPageInput = useCallback((value: string) => {
        setStateField('pageInput', value);
    }, [setStateField]);

    const setCurrentPrompt = useCallback((value: string) => {
        setStateField('currentPrompt', value);
    }, [setStateField]);

    const setPubRebuttal = useCallback((value: boolean) => {
        setStateField('pub_rebuttal', value);
    }, [setStateField]);

    const setOpenModalPaper = useCallback((paper: any) => {
        setStateField('openModalPaper', paper);
    }, [setStateField]);

    const setUserPrompt = useCallback((value: string) => {
        setStateField('userPrompt', value);
    }, [setStateField]);

    const setShowConfirmationModal = useCallback((value: boolean) => {
        setStateField('showConfirmationModal', value);
    }, [setStateField]);

    const setConfirmationPrompt = useCallback((value: string) => {
        setStateField('confirmationPrompt', value);
    }, [setStateField]);

    const setUserRebuttal = useCallback((value: boolean) => {
        setStateField('user_rebuttal', value);
    }, [setStateField]);

    const toggleAbstract = useCallback((index: number) => {
        setState(prev => {
            const newExpanded = new Set(prev.expandedAbstracts);
            if (newExpanded.has(index)) {
                newExpanded.delete(index);
            } else {
                newExpanded.add(index);
            }
            return { ...prev, expandedAbstracts: newExpanded };
        });
    }, []);

    const toggleAuthors = useCallback((index: number) => {
        setState(prev => {
            const newExpanded = new Set(prev.expandedAuthors);
            if (newExpanded.has(index)) {
                newExpanded.delete(index);
            } else {
                newExpanded.add(index);
            }
            return { ...prev, expandedAuthors: newExpanded };
        });
    }, []);





    return (
        <div style={adminStyles.container}>
            <div className='py-2 d-flex justify-content-center'> 
                <div className='d-flex' style={{ height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
                    <div className='col-2 d-none d-lg-block me-3 d-flex flex-column'>
                        <div className='d-flex mb-3' style={{ minHeight: '45px' }}> </div>
                        <Leaderboard onPaperClick={setSearchTerm} />
                    </div> 
                    <div className='col-10 flex-grow-1 d-flex flex-column' style={{ overflow: 'hidden' }}>
                        <div className="d-flex mb-3 justify-content-center align-items-center gap-4">
                            {(yearLoading || state.isYearChanging) && (
                                <div className="d-flex align-items-center text-primary">
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    <span>...</span>
                                </div>
                            )}
                            <Pagination 
                                currentPage={state.currentPage}
                                totalPages={totalPages}
                                totalRecords={state.totalRecords}
                                pageInput={state.pageInput}
                                setPageInput={setPageInput}
                                goToNextPage={goToNextPage}
                                goToPreviousPage={goToPreviousPage}
                                setCurrentPage={setCurrentPage}
                                searchTerm={state.searchTerm}
                                setSearchTerm={setSearchTerm}
                            />
                            <SearchBar 
                                searchTerm={state.searchTerm}
                                setSearchTerm={setSearchTerm}
                            />
                        </div>
                        <div className="d-flex flex-column" style={{ overflow: 'hidden' }}>
                            <div className="card border-0 shadow-lg flex-grow-1 d-flex flex-column" style={{ ...adminStyles.table.card, overflow: 'hidden' }}> 
                                <div className="card-header" style={adminStyles.table.header}>
                                    <div className="row align-items-center text-center" style={adminStyles.table.headerRow}>
                                        <div className="col-3">Paper Title</div>
                                        <div className='col-2'>Authors</div>
                                        <div className="col-1">Rating</div>
                                        <div className='col-1'>Ratings</div>
                                        <div className='col-1 px-1'>Confidence</div>
                                        <div className='col-2'>Decision</div>
                                        <div className='col-2'>
                                            <span className="d-flex flex-column align-items-center justify-content-center h-100">
                                                <div className="d-flex align-items-center gap-2">
                                                    <button 
                                                        onClick={() => setState(prev => ({ ...prev, showPrompt: !prev.showPrompt }))}
                                                        className="btn btn-bg rounded-pill text-white"
                                                    >
                                                        {state.showPrompt ? (
                                                            <>
                                                            <span><FaEyeSlash/></span>
                                                            </>
                                                        ) : (
                                                            <>
                                                            <span><FaEye /></span> 
                                                            </>
                                                        )}
                                                    </button>
                                                    <PromptDropdown
                                                        selectedPrompt={state.currentPrompt}
                                                        onPromptChange={setCurrentPrompt}
                                                        isLoading={state.isLoadingPredictions}
                                                    />
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-end mt-4 me-5" style={{
                                    borderBottom: '1px solid #e9ecef',
                                    backgroundColor: '#ffffff',
                                    borderBottomLeftRadius: '8px',
                                    borderBottomRightRadius: '8px'
                                }}>
                    
                                    <RebuttalToggle
                                        checked={state.pub_rebuttal}
                                        onChange={setPubRebuttal}
                                    />
                                </div>
                                <div className="card-body p-0 flex-grow-1" style={{ ...adminStyles.table.body, overflow: 'auto' }}>
                                {state.showPrompt && (
                                        <tr style={{ 
                                        backgroundColor: '#f8fafc',
                                        borderColor: '#e5e7eb'
                                        }}>
                                        <td colSpan={10} className="p-3" style={{ 
                                            borderColor: '#e5e7eb',
                                            color: '#374151',
                                            fontSize: '0.8rem',
                                            lineHeight: '1.3'
                                        }}>
                                            <div className="bg-light p-3 rounded" >
                                            {state.currentPrompt}
                                            </div>
                                        </td>
                                        </tr>
                                    )}
                                    {(state.isLoadingData || yearLoading || state.isYearChanging) && (
                                        <div className="text-center py-5" style={adminStyles.loadingState.container}>
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p>{state.isYearChanging ? 'Changing year...' : yearLoading ? 'Loading year...' : 'Loading papers...'}</p>
                                        </div>
                                    )}
                                    {!state.isLoadingData && processedBib.length === 0 && state.searchTerm && (
                                        <div className="text-center py-5" style={adminStyles.emptyState.container}>
                                            <i className="fas fa-search" style={adminStyles.emptyState.icon}></i>
                                            <h5>No papers found</h5>
                                            <p>No papers match "{state.searchTerm}"</p>
                                        </div>
                                    )}
                                    {!state.isLoadingData && processedBib.length === 0 && !state.searchTerm && (
                                        <div className="text-center py-5" style={adminStyles.emptyState.container}>
                                            <i className="fas fa-inbox" style={adminStyles.emptyState.icon}></i>
                                            <h5>No papers available</h5>
                                            <p>There are no papers to display</p>
                                        </div>
                                    )}
                                    {!state.isLoadingData && processedBib.length > 0 && processedBib.map((br: any, index: number) => 
                                        <PaperRow
                                            key={br._id || index}
                                            paper={br}
                                            index={index}
                                            predictionsMap={predictionsMap}
                                            expandedAbstracts={state.expandedAbstracts}
                                            expandedAuthors={state.expandedAuthors}
                                            toggleAbstract={toggleAbstract}
                                            toggleAuthors={toggleAuthors}
                                            setOpenModalPaper={setOpenModalPaper}
                                            setSearchTerm={setSearchTerm}
                                            currentPrompt={state.currentPrompt}
                                        />
                                    )}  
                                </div>
                            </div>  
                        </div>
                    </div>
                </div>
            </div>

            <PromptInputModal
                openModalPaper={state.openModalPaper}
                userPrompt={state.userPrompt}
                setUserPrompt={setUserPrompt}
                currentPrompt={state.currentPrompt}
                setOpenModalPaper={setOpenModalPaper}
                onConfirm={() => {
                    if (state.openModalPaper) {    
                        const promptToUse = state.userPrompt || state.currentPrompt;
                        setUserPrompt(promptToUse);
                        setConfirmationPrompt(util.prompt_tmp.replace("{{ task }}", promptToUse));
                        setShowConfirmationModal(true);
                    }
                }}
            />

            <ConfirmationModal
                showConfirmationModal={state.showConfirmationModal}
                openModalPaper={state.openModalPaper}
                confirmationPrompt={state.confirmationPrompt}
                setConfirmationPrompt={setConfirmationPrompt}
                user_rebuttal={state.user_rebuttal}
                setUserRebuttal={setUserRebuttal}
                setShowConfirmationModal={setShowConfirmationModal}
                onConfirm={() => {
                    if (state.openModalPaper) {    
                        handlePrompting(state.openModalPaper.url, state.openModalPaper._id, state.user_rebuttal ? 1 : 0);
                    }
                }}
            />
        </div>
    );
}

export default AdminHome;