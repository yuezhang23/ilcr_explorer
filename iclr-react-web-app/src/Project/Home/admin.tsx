import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
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
    getConfidenceColor, 
    getDecisionColors, 
    getPredictionColors, 
    getIndividualRatingColor, 
    getRowBackground, 
    getPaginationButtonStyle,
    getDropdownButtonStyle,
    getDropdownMenuStyle,
    getTooltipArrowStyle
} from './styles/adminStyles';
import './styles/admin.css';
import Leaderboard from './components/Leaderboard';
axios.defaults.withCredentials = true;

// Helper function to process papers data
function processPapersData(data: any[]) {
    return data.map((m: any) => {
        const {metareviews, ...bib} = m;
        const ratings = [];
        const confidences = [];

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
        }
        
        const rating = ratings.length > 0 ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)) : 0;
        const confidence = confidences.length > 0 ? parseFloat((confidences.reduce((a, b) => a + b, 0) / confidences.length).toFixed(2)) : 0;

        return {
            ...bib,
            rating,
            confidence,
            ratings,
            confidences
        };
    });
}

// Memoized Pagination Component
const Pagination = React.memo(({ 
    currentPage, 
    totalPages, 
    totalRecords, 
    pageInput, 
    setPageInput, 
    goToNextPage, 
    goToPreviousPage, 
    setCurrentPage 
}: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    pageInput: string;
    setPageInput: (value: string) => void;
    goToNextPage: () => void;
    goToPreviousPage: () => void;
    setCurrentPage: (page: number) => void;
}) => {
    const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPageInput(e.target.value);
    }, [setPageInput]);

    const handlePageInputBlur = useCallback(() => {
        let pageNum = parseInt(pageInput, 10);
        if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
        if (pageNum > totalPages) pageNum = totalPages;
        setCurrentPage(pageNum);
    }, [pageInput, totalPages, setCurrentPage]);

    const handlePageInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            let pageNum = parseInt(pageInput, 10);
            if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
            if (pageNum > totalPages) pageNum = totalPages;
            setCurrentPage(pageNum);
        }
    }, [pageInput, totalPages, setCurrentPage]);

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

    if (totalRecords === 0) return null;

    return (
        <div className="d-flex align-items-center">
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
        </div>
    );
});

// Memoized Search Component
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
        <div className="d-flex align-items-center">
            <div className="position-relative">
                <i className="fas fa-search position-absolute" 
                   style={adminStyles.search.icon}></i>
                <input
                    type="text"
                    placeholder="Search papers by title or author..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="form-control rounded-pill"
                    style={adminStyles.search.input}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                />
            </div>
        </div>
    );
});

// Memoized Paper Row Component
const PaperRow = React.memo(({ 
    paper, 
    index, 
    currentIclrName, 
    predictionsMap, 
    expandedAbstracts, 
    expandedAuthors, 
    toggleAbstract, 
    toggleAuthors, 
    setOpenModalPaper, 
    handleDropdownOptionMouseEnter, 
    handleDropdownOptionMouseLeave, 
    currentPrompt 
}: {
    paper: any;
    index: number;
    currentIclrName: string;
    predictionsMap: Map<string, string>;
    expandedAbstracts: Set<number>;
    expandedAuthors: Set<number>;
    toggleAbstract: (index: number) => void;
    toggleAuthors: (index: number) => void;
    setOpenModalPaper: (paper: any) => void;
    handleDropdownOptionMouseEnter: (event: React.MouseEvent, prompt: string) => void;
    handleDropdownOptionMouseLeave: () => void;
    currentPrompt: string;
}) => {
    const isAbstractExpanded = expandedAbstracts.has(index);
    const isAuthorsExpanded = expandedAuthors.has(index);
    
    const handleRowMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        Object.assign(e.currentTarget.style, adminStyles.row.hover);
    }, []);

    const handleRowMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const baseStyle = getRowBackground(index, isAbstractExpanded || isAuthorsExpanded);
        e.currentTarget.style.backgroundColor = baseStyle.backgroundColor || '#ffffff';
        e.currentTarget.style.transform = 'translateX(0)';
    }, [index, isAbstractExpanded, isAuthorsExpanded]);

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

    const handlePredictionMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        handleDropdownOptionMouseEnter(e, currentPrompt);
    }, [handleDropdownOptionMouseEnter, currentPrompt]);

    // Use memoized prediction lookup
    const prediction = predictionsMap.get(paper._id);

    const buttonText = useMemo(() => {
        return prediction || <span>O</span>;
    }, [prediction]);

    const predictionButtonStyle = useMemo(() => {
        return { ...getPredictionColors(prediction), ...adminStyles.button.prediction };
    }, [prediction]);

    return (
        <div 
            className="border-bottom" 
            style={{ ...getRowBackground(index, isAbstractExpanded || isAuthorsExpanded) }}
            onMouseEnter={handleRowMouseEnter}
            onMouseLeave={handleRowMouseLeave}
        >
            <div className="row align-items-center text-center">
                <div className="col-3">
                    <div className='text-center d-block mb-2'>
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
                            onClick={() => toggleAbstract(index)}
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
                        <ul className='list-unstyled mb-0' style={isAuthorsExpanded ? adminStyles.authors.listExpanded : adminStyles.authors.list}>
                            {paper.authors.map((author: string, idx: number) => (
                                <li key={idx} style={adminStyles.authors.item}>
                                    {author}
                                </li>
                            ))}
                        </ul>
                        {paper.authors.length > 5 && (
                            <button 
                                onClick={() => toggleAuthors(index)}
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
                        <ul className='list-unstyled mb-0'>
                            {paper.ratings.map((rating: number, idx: number) => (
                                <li key={idx} style={getIndividualRatingColor(rating)}>
                                    {rating}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className='col-2'>
                    <div className="fw-bold" style={getConfidenceColor(paper.confidence)}>
                        {paper.confidence}
                    </div>
                </div>
                <div className='col-2'>
                    <span className="badge rounded-pill px-3 py-2" 
                          style={{ ...getDecisionColors(paper.decision), ...adminStyles.badge.decision }}>
                        {paper.decision}
                    </span>
                </div>
                <div className='col-1'>
                    <div className="text-muted" style={adminStyles.prediction.container}>
                        <button 
                            className="btn btn-sm rounded-pill" 
                            style={predictionButtonStyle}
                            onClick={handlePredictionClick}
                            onMouseEnter={handlePredictionMouseEnter}
                            onMouseLeave={handleDropdownOptionMouseLeave}
                        >
                            {buttonText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

function AdminHome() {
    const {currentIclr, currentIclrName} = useSelector((state: ProjectState) => state.iclrReducer)
    const {currentPreds} = useSelector((state: ProjectState) => state.predictionReducer)
    const [bib, setBib] = useState<any[]>([]);
    const [expandedAbstracts, setExpandedAbstracts] = useState<Set<number>>(new Set());
    const [expandedAuthors, setExpandedAuthors] = useState<Set<number>>(new Set());
    const dispatch = useDispatch();

    // Use global year context instead of local state
    const { currentYear, availableYears, setYear: setGlobalYear } = useYear();

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageInput, setPageInput] = useState<string>('1');
    const [recordsPerPage] = useState<number>(20);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');

    
    // Loading states
    const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
    const [isLoadingPredictions, setIsLoadingPredictions] = useState<boolean>(false);
    
    // Remove sortOrder, randomOrder, and related states
    // const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'random'>('desc');
    // const [randomOrder, setRandomOrder] = useState<number[]>([]);

    const [userPrompt, setUserPrompt] = useState<string>("");
    const [currentPrompt, setCurrentPrompt] = useState<string>(home.BASIC_PROMPT);
    const [openModalPaper, setOpenModalPaper] = useState<any | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
    const [confirmationPrompt, setConfirmationPrompt] = useState<string>("");
    const [user_rebuttal, setUserRebuttal] = useState<boolean>(false); // New state for Rebuttal toggle
    const [pub_rebuttal, setPubRebuttal] = useState<boolean>(false);
    
    
    // New state for dropdown tooltip
    const [dropdownTooltipVisible, setDropdownTooltipVisible] = useState<boolean>(false);
    const [dropdownTooltipPosition, setDropdownTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
    const [dropdownTooltipContent, setDropdownTooltipContent] = useState<string>("");
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    
    // Conference dropdown state
    const [conferenceDropdownOpen, setConferenceDropdownOpen] = useState<boolean>(false);
    
    // Memoize expensive computations
    const processedBib = useMemo(() => processPapersData(bib), [bib]);
    const totalPages = useMemo(() => Math.ceil(totalRecords / recordsPerPage), [totalRecords, recordsPerPage]);
    const currentRecords = useMemo(() => processedBib, [processedBib]);
    
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
    
    const handlePrompting = useCallback(async (url: string, id: string, rebuttal: number) => {
        if (userPrompt === "") {
            setUserPrompt(home.BASIC_PROMPT);
        }
        await home.promptSubmissionByUrl(url, confirmationPrompt, rebuttal).then((response) => {
            dispatch(updatePrediction({paper_id: id, prompt: userPrompt, prediction: response.toLowerCase() === 'yes' || response.toLowerCase() === 'accept' ? "Accept" : "Reject"}));
            setOpenModalPaper(null);
            setShowConfirmationModal(false);
            setUserRebuttal(false);
        }).catch((error) => {
            console.error(error);
        });
    }, [userPrompt, confirmationPrompt, dispatch]);

    // Consolidated data fetching function - REMOVED currentPreds dependency to prevent infinite loop
    const fetchPaginatedData = useCallback(async () => {
        setIsLoadingData(true);
        try {
            const skip = (currentPage - 1) * recordsPerPage;
            const result = await home.findPaginatedIclrSubmissions(recordsPerPage, skip, searchTerm);
            setBib(result.data);
            setTotalRecords(result.totalCount);
            dispatch(setIclr(result.data));
            dispatch(setIclrName(result.name));
        } catch (error: any) {
            console.error('Error fetching paginated data:', error.response?.data || error);
        } finally {
            setIsLoadingData(false);
        }
    }, [currentPage, recordsPerPage, searchTerm, dispatch, currentYear]);

    // Separate function for fetching predictions - only called when needed
    const fetchPredictionsForCurrentPage = useCallback(async (papers: any[], prompt: string, rebuttal: boolean) => {
        setIsLoadingPredictions(true);
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
            setIsLoadingPredictions(false);
        }
    }, [dispatch]);

    // Main data fetching effect
    useEffect(() => {
        fetchPaginatedData();
    }, [fetchPaginatedData]);

    // Effect to fetch predictions when papers change or prompt/rebuttal changes
    useEffect(() => {
        if (bib.length > 0) {
            fetchPredictionsForCurrentPage(bib, currentPrompt, pub_rebuttal);
        }
    }, [bib, currentPrompt, pub_rebuttal, fetchPredictionsForCurrentPage]);

    // Remove the old "fetch all predictions on mount" logic - no longer needed

    useEffect(() => {
        setCurrentPage(1); 
        setExpandedAbstracts(new Set());
        setExpandedAuthors(new Set());
    }, [searchTerm]);

    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);
    
    // Add click outside handler for dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (dropdownOpen && !target.closest('.position-relative')) {
                setDropdownOpen(false);
                setDropdownTooltipVisible(false); // Hide tooltip when dropdown closes
            }
            if (conferenceDropdownOpen && !target.closest('.conference-dropdown-container')) {
                setConferenceDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen, conferenceDropdownOpen]);
    



    const goToNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    }, [currentPage, totalPages]);

    const goToPreviousPage = useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    }, [currentPage]);

    const toggleAbstract = useCallback((index: number) => {
        setExpandedAbstracts(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(index)) {
                newExpanded.delete(index);
            } else {
                newExpanded.add(index);
            }
            return newExpanded;
        });
    }, []);

    const toggleAuthors = useCallback((index: number) => {
        setExpandedAuthors(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(index)) {
                newExpanded.delete(index);
            } else {
                newExpanded.add(index);
            }
            return newExpanded;
        });
    }, []);

    // Tooltip handlers for dropdown options
    const handleDropdownOptionMouseEnter = useCallback((event: React.MouseEvent, prompt: string) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownTooltipPosition({
            x: rect.left - 10, // Position to the left of the element
            y: rect.top + rect.height / 2 // Center vertically
        });
        setDropdownTooltipContent(prompt);
        setDropdownTooltipVisible(true);
    }, []);

    const handleDropdownOptionMouseLeave = useCallback(() => {
        setDropdownTooltipVisible(false);
    }, []);

    return (
    <div style={adminStyles.container}>
        <div className='px-5 py-2 d-flex justify-content-between align-items-center' > 
            <div className="d-flex ms-5 align-items-center position-relative conference-dropdown-container">
                <label className="me-2 fw-bold text-dark" style={{ fontSize: '1.2rem' }}>
                    ICLR
                </label>
                <button 
                    className="btn btn-sm dropdown-toggle" 
                    onClick={() => setConferenceDropdownOpen(!conferenceDropdownOpen)}
                    style={{
                        // border: '3px solid #3b82f6',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#1e40af',
                        backgroundColor: '#dbeafe',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
                        boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                        fontSize: '0.9rem',
                        minWidth: '80px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#bfdbfe';
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.color = '#1e3a8a';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#dbeafe';
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.color = '#1e40af';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                    }}
                >
                    {currentYear}
                </button>                    
                {conferenceDropdownOpen && (
                    <div 
                        className="dropdown-menu show position-absolute"
                        style={getDropdownMenuStyle(true)}
                    >
                        {availableYears.map((y: string) => (
                            <button
                                key={y}
                                className={`dropdown-item ${currentYear === y ? 'active' : ''}`}
                                onClick={async () => {
                                    const success = await setGlobalYear(y);
                                    if (success) {
                                        setConferenceDropdownOpen(false);
                                    }
                                }}
                                style={currentYear === y ? adminStyles.dropdown.itemActive : adminStyles.dropdown.item}
                                onMouseEnter={(e) => {
                                    if (currentYear !== y) {
                                        Object.assign(e.currentTarget.style, adminStyles.dropdown.itemHover);
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (currentYear !== y) {
                                        Object.assign(e.currentTarget.style, adminStyles.dropdown.item);
                                    }
                                }}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="d-flex align-items-center gap-4">
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalRecords={totalRecords}
                    pageInput={pageInput}
                    setPageInput={setPageInput}
                    goToNextPage={goToNextPage}
                    goToPreviousPage={goToPreviousPage}
                    setCurrentPage={setCurrentPage}
                />
                <SearchBar 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                />
                <div className="d-flex align-items-center">
                    <Link
                        to="/Home/Analytics"
                        className="btn btn-sm mx-2"
                        style={{
                            borderRadius: '8px',
                            padding: '6px 12px',
                            color: '#1e40af',
                            backgroundColor: '#dbeafe',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
                            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.1)',
                            fontSize: '0.9rem',
                            minWidth: '80px',
                            textDecoration: 'none'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#bfdbfe';
                            e.currentTarget.style.color = '#1e3a8a';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#dbeafe';
                            e.currentTarget.style.color = '#1e40af';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.1)';
                        }}
                        >
                        Analytics
                    </Link>
                </div>
            </div>
        </div>
        <div className='d-flex px-5' style={{ minHeight: 'calc(100vh - 200px)' }}>
            <div className='col-2 d-none d-lg-block me-3 d-flex flex-column'>
                <Leaderboard />
            </div> 
            <div className='col-10 flex-grow-1 d-flex flex-column'>
                <div className="mx-2 flex-grow-1 d-flex flex-column">
                    <div className="card border-0 shadow-lg flex-grow-1 d-flex flex-column" style={adminStyles.table.card}> 
                        <div className="card-header border-0 " 
                            style={adminStyles.table.header}>
                            <div className="row align-items-center text-center" style={adminStyles.table.headerRow}>
                                <div className="col-3">
                                    Paper Title
                                </div>
                                <div className='col-2'>
                                    Authors
                                </div>
                                <div className="col-1">
                                    Rating
                                </div>
                                <div className='col-1'>
                                    Ratings
                                </div>
                                <div className='col-2'> 
                                    Confidence 
                                </div>
                                <div className='col-2'>
                                    Decision
                                </div>
                                <div className='col-1'>
                                    <div className="d-flex flex-column align-items-center justify-content-center h-100">
                                        <div className="position-relative mb-2">
                                            <button 
                                                className="btn btn-sm dropdown-toggle rounded-5 fw-bold fs-8" 
                                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                                disabled={isLoadingPredictions}
                                                style={{
                                                    backgroundColor: '#f8f9fa',
                                                    border: '1px solid #dee2e6',
                                                    color: '#495057',
                                                    transition: 'all 0.2s ease',
                                                    ...(isLoadingPredictions && { opacity: 0.6 })
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (!isLoadingPredictions) {
                                                        e.currentTarget.style.backgroundColor = '#e9ecef';
                                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!isLoadingPredictions) {
                                                        e.currentTarget.style.backgroundColor = '#f8f9fa';
                                                        e.currentTarget.style.transform = 'translateY(0)';
                                                    }
                                                }}
                                            >
                                                {isLoadingPredictions ? (
                                                    <>
                                                        <div className="spinner-border spinner-border-sm me-1" role="status">
                                                            <span className="visually-hidden">Loading...</span>
                                                        </div>
                                                        Loading...
                                                    </>
                                                ) : (
                                                    `Prompt ${home.PROMPT_CANDIDATES.findIndex(p => p === currentPrompt) + 1}`
                                                )}
                                            </button>                    
                                            {dropdownOpen && (
                                                <div 
                                                    className="dropdown-menu show position-absolute"
                                                    style={getDropdownMenuStyle(true)}
                                                >
                                                    {home.PROMPT_CANDIDATES.map((prompt, index) => (
                                                        <button
                                                            key={index}
                                                            className={`dropdown-item ${currentPrompt === prompt ? 'active' : ''}`}
                                                            onClick={() => {
                                                                setCurrentPrompt(prompt);
                                                                setDropdownOpen(false);
                                                                setDropdownTooltipVisible(false); // Hide tooltip when option is clicked
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                handleDropdownOptionMouseEnter(e, prompt);
                                                                if (currentPrompt !== prompt) {
                                                                    Object.assign(e.currentTarget.style, adminStyles.dropdown.itemHover);
                                                                }
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                handleDropdownOptionMouseLeave();
                                                                if (currentPrompt !== prompt) {
                                                                    Object.assign(e.currentTarget.style, adminStyles.dropdown.item);
                                                                }
                                                            }}
                                                            style={currentPrompt === prompt ? adminStyles.dropdown.itemActive : adminStyles.dropdown.item}
                                                        >
                                                            Prompt {index + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="rebuttalSwitch"
                                                checked={pub_rebuttal}
                                                onChange={() => {
                                                    setPubRebuttal(!pub_rebuttal);
                                                }}
                                                style={adminStyles.form.switch}
                                            />
                                            <label className={pub_rebuttal ? "form-check-label text-primary" : "form-check-label text-white"} htmlFor="rebuttalSwitch" style={adminStyles.form.switchLabel}>
                                                <b>Rebuttal</b>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                </div>
                        </div>
                        <>
                        {/* {JSON.stringify(currentPreds)} */}
                        </>
                        <div className="card-body p-0 flex-grow-1"
                            style={adminStyles.table.body}>
                            {isLoadingData && (
                                <div className="text-center py-5" style={adminStyles.loadingState.container}>
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p>Loading papers...</p>
                                </div>
                            )}
                            {!isLoadingData && currentRecords.length === 0 && searchTerm && (
                                <div className="text-center py-5" style={adminStyles.emptyState.container}>
                                    <i className="fas fa-search" style={adminStyles.emptyState.icon}></i>
                                    <h5>No papers found</h5>
                                    <p>No papers match "{searchTerm}"</p>
                                </div>
                            )}
                            {!isLoadingData && currentRecords.length === 0 && !searchTerm && (
                                <div className="text-center py-5" style={adminStyles.emptyState.container}>
                                    <i className="fas fa-inbox" style={adminStyles.emptyState.icon}></i>
                                    <h5>No papers available</h5>
                                    <p>There are no papers to display</p>
                                </div>
                            )}
                            {!isLoadingData && currentRecords.length > 0 && currentRecords.map((br: any, index : number) => 
                                <PaperRow
                                    key={br._id || index}
                                    paper={br}
                                    index={index}
                                    currentIclrName={currentIclrName}
                                    predictionsMap={predictionsMap}
                                    expandedAbstracts={expandedAbstracts}
                                    expandedAuthors={expandedAuthors}
                                    toggleAbstract={toggleAbstract}
                                    toggleAuthors={toggleAuthors}
                                    setOpenModalPaper={setOpenModalPaper}
                                    handleDropdownOptionMouseEnter={handleDropdownOptionMouseEnter}
                                    handleDropdownOptionMouseLeave={handleDropdownOptionMouseLeave}
                                    currentPrompt={currentPrompt}
                                />
                            )}  
                        </div>
                    </div>  
                </div>
            </div>
        </div>

        {/* Modal for prompt input - rendered outside table structure */}
        {openModalPaper && (
            <div style={adminStyles.modal.overlay}>
                <div style={adminStyles.modal.container}>
                    <h4 className="mb-4 text-center" style={adminStyles.modal.title}>
                        Prompting ... 
                    </h4>
                    <div style={adminStyles.modal.textareaContainer}>
                        <textarea
                            className="form-control mb-4"
                            rows={10}
                            value={userPrompt}
                            onChange={e => setUserPrompt(e.target.value)}
                            placeholder=""
                            style={adminStyles.modal.textarea}
                            autoFocus
                        />
                        {!userPrompt && (
                            <div style={adminStyles.modal.placeholder}>
                                Enter your custom prompt or leave blank to use the default prompt:
                                <br />
                                <div style={adminStyles.modal.placeholderText}>{currentPrompt}</div>
                            </div>
                        )}
                    </div>
                    <div className="d-flex gap-3 justify-content-end">
                        <button 
                            className="btn btn-outline-secondary px-4 py-2" 
                            onClick={() => {
                                setOpenModalPaper(null);
                            }}
                            style={adminStyles.modal.button}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn btn-primary px-4 py-2" 
                            onClick={() => {
                                if (openModalPaper) {    
                                    setUserPrompt(userPrompt !== "" ? userPrompt : currentPrompt);
                                    setConfirmationPrompt(util.prompt_tmp.replace("{{ task }}", userPrompt !== "" ? userPrompt : currentPrompt));
                                    setShowConfirmationModal(true);
                                }
                            }}
                            style={adminStyles.modal.submitButton}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Confirmation Modal for prompt review */}
        {showConfirmationModal && (
            <div style={adminStyles.modal.overlay}>
                <div style={adminStyles.modal.container}>
                    <h4 className="mb-4 text-center" style={adminStyles.modal.title}>
                        Confirm Template
                    </h4>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Paper Title:</label>
                        <div className="text-muted">
                            {openModalPaper?.url ? (
                                <a href={openModalPaper.url} target="_blank" rel="noopener noreferrer" style={adminStyles.modal.link}>
                                    {openModalPaper.title}
                                </a>
                            ) : (
                                openModalPaper?.title
                            )}
                        </div>
                    </div>
                    <div style={adminStyles.modal.textareaContainer}>
                        <label className="form-label fw-bold">Prompt Template:</label>
                          {/* Info message for Rebuttal toggle */}
                          <div style={adminStyles.infoMessage}>
                            the following {'{text}'} under Prediction will be replaced with complete official reviews.
                        </div>
                        <br />
                        <textarea
                            className="form-control mb-4"
                            rows={8}
                            value={confirmationPrompt}
                            onChange={e => setConfirmationPrompt(e.target.value)}
                            placeholder="Enter your prompt here..."
                            style={adminStyles.modal.textarea}
                            autoFocus
                        />
                    </div>
                    <div className="form-check mb-3">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="rebuttalToggle"
                            checked={user_rebuttal}
                            onChange={() => setUserRebuttal(!user_rebuttal)}
                        />
                        <label className="form-check-label fw-bold text-danger" htmlFor="rebuttalToggle">
                            Rebuttal
                        </label>
                        {/* Info message for Rebuttal toggle */}
                        <div style={adminStyles.infoMessage}>
                            {user_rebuttal
                                ? 'Rebuttal Included in {text}'
                                : ''}
                        </div>
                    </div>
                    <div className="d-flex gap-3 justify-content-end">
                        <button 
                            className="btn btn-outline-secondary px-4 py-2" 
                            onClick={() => {
                                setShowConfirmationModal(false);
                            }}
                            style={adminStyles.modal.button}
                        >
                            Back
                        </button>
                        <button 
                            className="btn btn-success px-4 py-2" 
                            onClick={() => {
                                if (openModalPaper) {    
                                    handlePrompting(openModalPaper.url, openModalPaper._id, user_rebuttal ? 1 : 0);
                                }
                            }}
                            style={adminStyles.modal.confirmSubmitButton}
                        >
                            Submit 
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Tooltip for dropdown options */}
        {dropdownTooltipVisible && (
            <div 
                style={{
                    ...adminStyles.tooltip.dropdown,
                    left: dropdownTooltipPosition.x,
                    top: dropdownTooltipPosition.y,
                    transform: 'translateX(-100%) translateY(-50%)' // Position to the left and center vertically
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
                        ...getTooltipArrowStyle('left')
                    }}
                />
            </div>
        )}
 
    </div>);
}
export default AdminHome;