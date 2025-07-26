import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ProjectState } from '../store';
import * as home from './home';
import * as util from './utility';
import axios from "axios";
import { FaDeleteLeft, FaChevronDown, FaChevronUp, FaEye, FaEyeSlash, FaCheck, FaN, FaX, FaO, FaStar } from 'react-icons/fa6';
import { setIclr, setIclrName } from '../Reducers/iclrReducer';
import { updatePrediction, setCurrentPreds } from '../Reducers/predictionReducer';
import { 
    adminStyles, 
    getRatingColor, 
    getConfidenceColor, 
    getDecisionColors, 
    getPredictionColors, 
    getIndividualRatingColor, 
    getRowBackground, 
    getPaginationButtonStyle 
} from './styles/adminStyles';
import './styles/admin.css';
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

function AdminHome() {
    const {currentIclr, currentIclrName} = useSelector((state: ProjectState) => state.iclrReducer)
    const {currentPreds} = useSelector((state: ProjectState) => state.predictionReducer)
    const {pathname} = useLocation()        
    const [bib, setBib] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [val, setVal] = useState('Likes')
    const [expandedAbstracts, setExpandedAbstracts] = useState<Set<number>>(new Set());
    const [expandedAuthors, setExpandedAuthors] = useState<Set<number>>(new Set());
    const dispatch = useDispatch();

    // Pagination state
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageInput, setPageInput] = useState<string>('1');
    const [recordsPerPage] = useState<number>(20);
    const [totalRecords, setTotalRecords] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>('');
    
    // Remove sortOrder, randomOrder, and related states
    // const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'random'>('desc');
    // const [randomOrder, setRandomOrder] = useState<number[]>([]);

    const [userPrompt, setUserPrompt] = useState<string>("");
    const [currentPrompt, setCurrentPrompt] = useState<string>(home.BASIC_PROMPT);
    const [openModalPaper, setOpenModalPaper] = useState<any | null>(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
    const [confirmationPrompt, setConfirmationPrompt] = useState<string>("");
    const [rebuttal, setRebuttal] = useState<boolean>(false); // New state for Rebuttal toggle
    
    
    // New state for dropdown tooltip
    const [dropdownTooltipVisible, setDropdownTooltipVisible] = useState<boolean>(false);
    const [dropdownTooltipPosition, setDropdownTooltipPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
    const [dropdownTooltipContent, setDropdownTooltipContent] = useState<string>("");
    const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
    
    const handlePrompting = async (url: string, id: string, rebuttal: number) => {
        if (userPrompt === "") {
            setUserPrompt(home.BASIC_PROMPT);
        }
        const response = await home.promptSubmissionByUrl(url, confirmationPrompt, rebuttal).then((response) => {
            dispatch(updatePrediction({paper_id: id, prompt: userPrompt, prediction: response}));
            setOpenModalPaper(null);
            setShowConfirmationModal(false);
            setRebuttal(false);
        }).catch((error) => {
            console.error(error);
        });
    }

    // Consolidated data fetching function
    const fetchPaginatedData = useCallback(async () => {
        try {
            const skip = (currentPage - 1) * recordsPerPage;
            const result = await home.findPaginatedIclrSubmissions(recordsPerPage, skip, searchTerm);
            setBib(processPapersData(result.data));
            setTotalRecords(result.totalCount);
            dispatch(setIclr(result.data));
            dispatch(setIclrName(result.name));

            // --- New logic for predictions ---
            // Get current predictions from Redux
            const preds = currentPreds || [];
            // Find papers on this page with prediction "O" or missing
            const papersNeedingPred = result.data.filter(paper => {
                const pred = preds.find(p => p.paper_id === paper._id);
                return !pred || pred.prediction === "O";
            });
            if (papersNeedingPred.length > 0) {
                // Fetch predictions for these papers (assuming you have such an API)
                const paperIds = papersNeedingPred.map((p : any) => p._id);
                const newPredictions = await home.getPredictionsByPaperIdsAndPrompt(paperIds, currentPrompt); // You may need to implement this
                // Merge new predictions into Redux state
                const updatedPreds = [
                    ...preds.filter(p => !paperIds.includes(p.paper_id)),
                    ...newPredictions
                ];
                dispatch(setCurrentPreds(updatedPreds));
            }
        } catch (error: any) {
            console.error('Error fetching paginated data:', error.response?.data || error);
        }
    }, [currentPage, recordsPerPage, searchTerm, dispatch, currentPreds, currentPrompt]);

    useEffect(() => {
        fetchPaginatedData();
    }, [fetchPaginatedData]);

    // Add new useEffect to handle prompt changes
    useEffect(() => {
        // When currentPrompt changes, we need to refetch predictions for current page
        if (bib.length > 0) {
            const fetchPredictionsForCurrentPrompt = async () => {
                try {
                    const paperIds = bib.map((p: any) => p._id);
                    const newPredictions = await home.getPredictionsByPaperIdsAndPrompt(paperIds, currentPrompt);
                    console.log("newPredictions[0].prediction", newPredictions[0].prediction);
                    
                    // Update Redux state with new predictions
                    const preds = currentPreds || [];
                    const updatedPreds = [
                        ...preds.filter(p => !paperIds.includes(p.paper_id)),
                        ...newPredictions
                    ];
                    dispatch(setCurrentPreds(updatedPreds));
                } catch (error) {
                    console.error('Error fetching predictions for new prompt:', error);
                }
            };
            fetchPredictionsForCurrentPrompt();
        }
    }, [currentPrompt, bib, dispatch, currentPreds]);

    // Remove the old "fetch all predictions on mount" logic
    useEffect(() => {
        async function fetchPredictions() {
            try {
                const predictions = await home.getAllPredictionsByBasicPrompt();
                dispatch(setCurrentPreds(predictions.map((m: any) => ({
                    paper_id: m.paper_id, 
                    prompt: m.prompt, 
                    prediction: m.prediction
                }))));
            } catch (error) {
                console.error('Error fetching predictions:', error);
            }
        }
        fetchPredictions();
    }, [dispatch]);

    useEffect(() => {
        setCurrentPage(1); // Reset to first page when search term changes
        setExpandedAbstracts(new Set());
        setExpandedAuthors(new Set());
    }, [searchTerm]);

    useEffect(() => {
        setPageInput(currentPage.toString());
    }, [currentPage]);
    
    // Add click outside handler for dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (dropdownOpen && !target.closest('.position-relative')) {
                setDropdownOpen(false);
                setDropdownTooltipVisible(false); // Hide tooltip when dropdown closes
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownOpen]);
    

    const handleDeleteSubmission = (bid: any) =>{
        const rest = currentIclr.filter((m) => m._id !== bid)
        home.deleteSubmission(bid).then((status) => {
            dispatch(setIclr(rest));
            // Also update local bib state to keep UI in sync
            setBib(prevBib => prevBib.filter((m) => m._id !== bid));
        });
    }


    const findUsrName = (id : any) =>{
        try {
            const nameU = users.find((i) => i._id === id).username
            return nameU
        } catch (error) {
        }
    }

    const currentRecords = bib;
    const totalPages = Math.ceil(totalRecords / recordsPerPage);

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };


    const toggleAbstract = (index: number) => {
        const newExpanded = new Set(expandedAbstracts);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedAbstracts(newExpanded);
    };

    const toggleAuthors = (index: number) => {
        const newExpanded = new Set(expandedAuthors);
        if (newExpanded.has(index)) {
            newExpanded.delete(index);
        } else {
            newExpanded.add(index);
        }
        setExpandedAuthors(newExpanded);
    };


    // Add hover state for clickable Rating link
    const [ratingLinkHover, setRatingLinkHover] = useState(false);


    // Tooltip handlers for dropdown options
    const handleDropdownOptionMouseEnter = (event: React.MouseEvent, prompt: string) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setDropdownTooltipPosition({
            x: rect.left - 10, // Position to the left of the element
            y: rect.top + rect.height / 2 // Center vertically
        });
        setDropdownTooltipContent(prompt);
        setDropdownTooltipVisible(true);
    };

    const handleDropdownOptionMouseLeave = () => {
        setDropdownTooltipVisible(false);
    };

    return (
    <div style={adminStyles.container}>
        <div className='px-5 py-2 d-flex justify-content-center align-items-center' > 
            {/* {JSON.stringify(totalRecords)} */}
            <div className="d-flex align-items-center gap-4">
                {totalRecords > 0 && (
                    <div className="d-flex align-items-center">
                        <button 
                            onClick={goToPreviousPage} 
                            disabled={currentPage === 1}
                            className="btn me-3 rounded-pill"
                            style={getPaginationButtonStyle(currentPage === 1)}
                            onMouseEnter={(e) => {
                                if (currentPage !== 1) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage !== 1) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
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
                                    onChange={e => {
                                        const val = e.target.value;
                                        setPageInput(val);
                                    }}
                                    onBlur={() => {
                                        let pageNum = parseInt(pageInput, 10);
                                        if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
                                        if (pageNum > totalPages) pageNum = totalPages;
                                        setCurrentPage(pageNum);
                                    }}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            let pageNum = parseInt(pageInput, 10);
                                            if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
                                            if (pageNum > totalPages) pageNum = totalPages;
                                            setCurrentPage(pageNum);
                                        }
                                    }}
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
                            onMouseEnter={(e) => {
                                if (currentPage !== totalPages) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (currentPage !== totalPages) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }
                            }}
                        >
                            Next →
                        </button>
                    </div>
                )}
                <div className="d-flex align-items-center">
                    <div className="position-relative">
                        <i className="fas fa-search position-absolute" 
                           style={adminStyles.search.icon}></i>
                        <input
                            type="text"
                            placeholder="Search papers by title or author..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control rounded-pill"
                            style={adminStyles.search.input}
                            onFocus={(e) => {
                                Object.assign(e.target.style, adminStyles.search.inputFocused);
                            }}
                            onBlur={(e) => {
                                Object.assign(e.target.style, adminStyles.search.inputBlurred);
                            }}
                        />
                    </div>
                </div>
                <div className="d-flex align-items-center">
                <Link
                    to="/Guest/Rating"
                    className="btn me-2 border-0"
                    style={adminStyles.clickableLink}
                    >
                    Analytics
                </Link>
                </div>


            </div>
        </div>
                
        <div className="mx-4">
            <div className="card border-0 shadow-lg" style={adminStyles.table.card}> 
                <div className="card-header border-0 py-2" 
                     style={adminStyles.table.header}>
                    <div className="row align-items-center text-center" style={adminStyles.table.headerRow}>
                        <div className="col-1">
                            Conference
                        </div>
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
                        <div className='col-1'> 
                            Confidence 
                        </div>
                        <div className='col-2'>Decision</div>
                        <div className='col-1'>
                            <div className="d-flex flex-column align-items-center position-relative">
                                <button 
                                    className="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    style={adminStyles.dropdown.button}
                                >
                                    Prompt {home.PROMPT_CANDIDATES.findIndex(p => p === currentPrompt) + 1}
                                </button>
                                
                                {dropdownOpen && (
                                    <div 
                                        className="dropdown-menu show position-absolute"
                                        style={adminStyles.dropdown.menu}
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
                                                onMouseEnter={(e) => handleDropdownOptionMouseEnter(e, prompt)}
                                                onMouseLeave={handleDropdownOptionMouseLeave}
                                                style={adminStyles.dropdown.item}
                                            >
                                                Prompt {index + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <>
                {/* {JSON.stringify(currentPreds)} */}
                </>
                <div className="card-body p-0"
                     style={adminStyles.table.body}>
                    {!currentRecords.length && searchTerm && (
                        <div className="text-center py-5" style={adminStyles.emptyState.container}>
                            <i className="fas fa-search" style={adminStyles.emptyState.icon}></i>
                            <h5>No papers found</h5>
                            <p>No papers match "{searchTerm}"</p>
                        </div>
                    )}
                    {!currentRecords.length && !searchTerm && (
                        <div className="text-center py-5" style={adminStyles.emptyState.container}>
                            <i className="fas fa-inbox" style={adminStyles.emptyState.icon}></i>
                            <h5>No papers available</h5>
                            <p>There are no papers to display</p>
                        </div>
                    )}
                    {currentRecords.length > 0 && currentRecords.map((br: any, index : number) => 
                    ( 
                        <div className="border-bottom" key={index} style={{ 
                            ...getRowBackground(index, expandedAbstracts.has(index) || expandedAuthors.has(index))
                        }}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, adminStyles.row.hover);
                        }}
                        onMouseLeave={(e) => {
                            const baseStyle = getRowBackground(index, expandedAbstracts.has(index) || expandedAuthors.has(index));
                            e.currentTarget.style.backgroundColor = baseStyle.backgroundColor || '#ffffff';
                            e.currentTarget.style.transform = 'translateX(0)';
                        }}>
                            <div className="row align-items-center">
                                <div className="col-1 text-center">
                                    <span className="badge rounded-pill px-3 py-2" 
                                          style={adminStyles.badge.conference}>
                                        {currentIclrName}
                                    </span>
                                </div>
                                <div className="col-3">
                                    <div className='text-center d-block mb-2'>
                                        {br.url ? (
                                            <a href={br.url} target="_blank" rel="noopener noreferrer" 
                                               className="text-decoration-none fw-bold"
                                               style={adminStyles.title.link}
                                               onMouseEnter={(e) => {
                                                   e.currentTarget.style.color = adminStyles.title.linkHover.color;
                                               }}
                                               onMouseLeave={(e) => {
                                                   e.currentTarget.style.color = adminStyles.title.link.color;
                                               }}>
                                                {br.title}
                                            </a>
                                        ) : (
                                            <strong className='fs-6' style={adminStyles.title.text}>{br.title}</strong>
                                        )}
                                    </div>
                                    <div className="text-center">
                                        <button 
                                            onClick={() => toggleAbstract(index)}
                                            className="btn btn-sm rounded-pill"
                                            style={expandedAbstracts.has(index) ? adminStyles.button.abstractExpanded : adminStyles.button.abstract}
                                            onMouseEnter={(e) => {
                                                if (!expandedAbstracts.has(index)) {
                                                    e.currentTarget.style.backgroundColor = adminStyles.button.abstractHover.backgroundColor;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!expandedAbstracts.has(index)) {
                                                    e.currentTarget.style.backgroundColor = adminStyles.button.abstract.backgroundColor;
                                                }
                                            }}
                                        >
                                            {expandedAbstracts.has(index) ? (
                                                <>
                                                    <FaEyeSlash /> Hide Abstract
                                                </>
                                            ) : (
                                                <>
                                                    <FaEye /> Show Abstract
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {expandedAbstracts.has(index) && (
                                        <div 
                                            className="mt-3 p-4 rounded-3"
                                            style={adminStyles.abstract.container}
                                        >
                                            {br.abstract}
                                        </div>
                                    )}
                                </div>
                                <div className='col-2 text-center'>
                                    <div className='w-100'>
                                        <ul className='list-unstyled mb-0' style={expandedAuthors.has(index) ? adminStyles.authors.listExpanded : adminStyles.authors.list}>
                                            {br.authors.map((author: string, idx: number) => (
                                                <li key={idx} style={adminStyles.authors.item}>
                                                    {author}
                                                </li>
                                            ))}
                                        </ul>
                                        {br.authors.length > 5 && (
                                            <button 
                                                onClick={() => toggleAuthors(index)}
                                                className="btn btn-sm rounded-pill mt-2"
                                                style={expandedAuthors.has(index) ? adminStyles.button.authorsExpanded : adminStyles.button.authors}
                                                onMouseEnter={(e) => {
                                                    if (!expandedAuthors.has(index)) {
                                                        e.currentTarget.style.backgroundColor = adminStyles.button.authorsHover.backgroundColor;
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (!expandedAuthors.has(index)) {
                                                        e.currentTarget.style.backgroundColor = adminStyles.button.authors.backgroundColor;
                                                    }
                                                }}
                                            >
                                                {expandedAuthors.has(index) ? (
                                                    <>
                                                        <FaChevronUp /> Show Less
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaChevronDown /> Show All ({br.authors.length})
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="col-1 text-center">
                                    <div className="fw-bold" style={getRatingColor(br.rating)}>
                                        {br.rating}
                                    </div>
                                </div>
                                <div className='col-1 text-center'>
                                    <div className='w-100'>
                                        <ul className='list-unstyled mb-0'>
                                            {br.ratings.map((rating: number, idx: number) => (
                                                <li key={idx} style={getIndividualRatingColor(rating)}>
                                                    {rating}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className='col-1 text-center'>
                                    <div className="fw-bold" style={getConfidenceColor(br.confidence)}>
                                        {br.confidence}
                                    </div>
                                </div>
                                <div className='col-2 text-center'>
                                    <span className="badge rounded-pill px-3 py-2" 
                                          style={{ ...getDecisionColors(br.decision), ...adminStyles.badge.decision }}>
                                        {br.decision}
                                    </span>
                                </div>
                                <div className='col-1 text-center'>
                                    <div className="text-muted" style={adminStyles.prediction.container}>
                                        {(() => {
                                            const prediction = currentPreds.find(pred => pred.paper_id === br._id)?.prediction;
                                            const buttonText = prediction || <><FaO /></>;
                                            
                                            return (
                                                <button className="btn btn-sm rounded-pill" 
                                                style={{ ...getPredictionColors(prediction), ...adminStyles.button.prediction }}
                                                    onClick={() => {
                                                        setOpenModalPaper(br);
                                                    }}
                                                    onMouseEnter={(e) => handleDropdownOptionMouseEnter(e, currentPrompt)}
                                                    onMouseLeave={handleDropdownOptionMouseLeave}>
                                                    {buttonText}
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>)
                        )
                        }  
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
                            rows={6}
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
                                <div style={adminStyles.modal.placeholderText}>{home.BASIC_PROMPT}</div>
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
                                    setUserPrompt(userPrompt !== "" ? userPrompt : home.BASIC_PROMPT);
                                    setConfirmationPrompt(util.prompt_tmp.replace("{{ task }}", userPrompt !== "" ? userPrompt : home.BASIC_PROMPT));
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
                            checked={rebuttal}
                            onChange={() => setRebuttal(!rebuttal)}
                        />
                        <label className="form-check-label fw-bold text-danger" htmlFor="rebuttalToggle">
                            Rebuttal
                        </label>
                        {/* Info message for Rebuttal toggle */}
                        <div style={adminStyles.infoMessage}>
                            {rebuttal
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
                                    handlePrompting(openModalPaper.url, openModalPaper._id, rebuttal ? 1 : 0);
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
                        ...adminStyles.tooltip.arrowRight
                    }}
                />
            </div>
        )}
 
    </div>);
}
export default AdminHome;