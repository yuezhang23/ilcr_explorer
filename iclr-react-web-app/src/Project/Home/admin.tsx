import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
} from './styles/adminStyles';
import './styles/admin.css';
import Leaderboard from './components/Leaderboard';
import PromptDropdown from './components/PromptDropdown';
import RebuttalToggle from './components/RebuttalToggle';
import PromptInputModal from './components/PromptInputModal';
import ConfirmationModal from './components/ConfirmationModal';
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

    return (
        <div className="d-flex align-items-center">
            {searchTerm && (
                <button 
                    onClick={() => setSearchTerm('')}
                    className="btn me-3 rounded-pill"
                    style={{
                        borderRadius: '8px',
                        padding: '6px 12px',
                        color: '#dc2626',
                        backgroundColor: '#fecaca',
                        position: 'absolute',
                        top: '25px',
                        left: '25%',
                        transform: 'translateX(-50%)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
                        boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1)',
                        fontSize: '0.9rem',
                        minWidth: '80px',
                        border: 'none'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#fca5a5';
                        e.currentTarget.style.color = '#b91c1c';
                        // e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 38, 38, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fecaca';
                        e.currentTarget.style.color = '#dc2626';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(220, 38, 38, 0.1)';
                    }}
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
            {/* {!searchTerm && (
                <div style={adminStyles.infoMessage} className="mt-1">
                    <i className="fas fa-info-circle me-1"></i>
                    Search across paper titles, author names, and abstract content
                </div>
            )} */}
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
    setSearchTerm,
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
    setSearchTerm: (value: string) => void;
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

    const handleAuthorClick = useCallback((author: string) => {
        setSearchTerm(author);
    }, [setSearchTerm]);



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
            // className="border-bottom" 
            style={{ ...getRowBackground(index, isAbstractExpanded || isAuthorsExpanded) }}
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
                        <ul className='list-unstyled' style={isAuthorsExpanded ? adminStyles.authors.listExpanded : adminStyles.authors.list}>
                            {paper.authors.map((author: string, idx: number) => (
                                <li key={idx} style={adminStyles.authors.item}>
                                    <button
                                        onClick={() => handleAuthorClick(author)}
                                        className="btn btn-link p-0 text-decoration-none"
                                        style={{
                                            color: 'inherit',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontSize: 'inherit',
                                            fontWeight: 'inherit',
                                            textAlign: 'center',
                                            width: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.textDecoration = 'underline';
                                            e.currentTarget.style.color = '#007bff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.textDecoration = 'none';
                                            e.currentTarget.style.color = 'inherit';
                                        }}
                                    >
                                        {author}
                                    </button>
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
                        <ul className='list-unstyled'>
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
                    <span className="badge rounded-pill px-3" 
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



    return (
    <div style={adminStyles.container}>
   
        <div className='py-2 d-flex justify-content-center' > 
        <div className='d-flex' style={{ height: 'calc(100vh - 150px)', overflow: 'hidden' }}>
            <div className='col-2 d-none d-lg-block me-3 d-flex flex-column'>
                <div className='d-flex mb-3' style={{ 
                    minHeight: '45px'
                }}> </div>
                <Leaderboard onPaperClick={setSearchTerm} />
            </div> 
            <div className='col-10 flex-grow-1 d-flex flex-column' style={{ overflow: 'hidden' }}>
                <div className="d-flex mb-3 justify-content-center align-items-center gap-4">
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalRecords={totalRecords}
                        pageInput={pageInput}
                        setPageInput={setPageInput}
                        goToNextPage={goToNextPage}
                        goToPreviousPage={goToPreviousPage}
                        setCurrentPage={setCurrentPage}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                    <SearchBar 
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />
                </div>
                <div className="flex-grow-1 d-flex flex-column" style={{ overflow: 'hidden' }}>
                    <div className="card border-0 shadow-lg flex-grow-1 d-flex flex-column" style={{ ...adminStyles.table.card, overflow: 'hidden' }}> 
                        <div className="card-header" 
                            style={adminStyles.table.header}>
                            <div className="mx-2 row align-items-center text-center" style={adminStyles.table.headerRow}>
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
                                        <div className="mb-0">
                                            <PromptDropdown
                                                currentPrompt={currentPrompt}
                                                onPromptChange={setCurrentPrompt}
                                                isLoading={isLoadingPredictions}
                                                showTooltip={true}
                                                tooltipPosition="left"
                                                buttonStyle={{
                                                    color: 'white',
                                                    padding: '6px 12px',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 500,
                                                    borderRadius: '16px',
                                                    transition: 'all 0.2s ease',
                                                    minWidth: '100px',
                                                    backgroundColor:"transparent"
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                </div>
                        </div>
                        <div className="d-flex justify-content-end px-4 mt-2" style={{
                            borderBottom: '1px solid #e9ecef',
                            backgroundColor: '#ffffff',
                            borderBottomLeftRadius: '8px',
                            borderBottomRightRadius: '8px'
                        }}>
                            <RebuttalToggle
                                checked={pub_rebuttal}
                                onChange={setPubRebuttal}
                            />
                        </div>
                        <div className="card-body p-0 flex-grow-1"
                            style={{ ...adminStyles.table.body, overflow: 'auto' }}>
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
                                    setSearchTerm={setSearchTerm}
                                    currentPrompt={currentPrompt}
                                />
                            )}  
                        </div>
                    </div>  
                </div>
            </div>
        </div>
        </div>


        {/* Modal for prompt input - rendered outside table structure */}
        <PromptInputModal
            openModalPaper={openModalPaper}
            userPrompt={userPrompt}
            setUserPrompt={setUserPrompt}
            currentPrompt={currentPrompt}
            setOpenModalPaper={setOpenModalPaper}
            onConfirm={() => {
                if (openModalPaper) {    
                    setUserPrompt(userPrompt !== "" ? userPrompt : currentPrompt);
                    setConfirmationPrompt(util.prompt_tmp.replace("{{ task }}", userPrompt !== "" ? userPrompt : currentPrompt));
                    setShowConfirmationModal(true);
                }
            }}
        />

        {/* Confirmation Modal for prompt review */}
        <ConfirmationModal
            showConfirmationModal={showConfirmationModal}
            openModalPaper={openModalPaper}
            confirmationPrompt={confirmationPrompt}
            setConfirmationPrompt={setConfirmationPrompt}
            user_rebuttal={user_rebuttal}
            setUserRebuttal={setUserRebuttal}
            setShowConfirmationModal={setShowConfirmationModal}
            onConfirm={() => {
                if (openModalPaper) {    
                    handlePrompting(openModalPaper.url, openModalPaper._id, user_rebuttal ? 1 : 0);
                }
            }}
        />


 
    </div>);
}
export default AdminHome;