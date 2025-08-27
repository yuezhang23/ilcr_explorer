import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { useYear } from '../../../contexts/YearContext';
import * as home from '../home';
import * as util from '../utility';
import { adminStyles } from '../styles/adminStyles';

// API service functions
const apiService = {
    // Get random papers from a specific year
    async getRandomPapers(year: string, count: number) {
        try {
            const response = await fetch(`/api/admin/iclr/random/${count}`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to fetch random papers: ${response.statusText}`);
            }
            
            const papers = await response.json();
            return papers;
        } catch (error) {
            console.error('Error fetching random papers:', error);
            throw error;
        }
    },

    // Run batch predictions on papers
    async runBatchPredictions(papers: any[], prompt: string, template: string, rebuttal: boolean = false) {
        try {
            const paperIds = papers.map(paper => paper._id);
            
            const response = await fetch('/api/prompt/predictions_by_paper_ids_and_prompt_and_rebuttal', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    paper_ids: paperIds,
                    prompt: template,
                    rebuttal: rebuttal ? 1 : 0
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to run batch predictions: ${response.statusText}`);
            }
            
            const predictions = await response.json();
            return predictions;
        } catch (error) {
            console.error('Error running batch predictions:', error);
            throw error;
        }
    }
};

const Prompting: React.FC = () => {
    const { currentYear, availableYears } = useYear();
    

    
    // Internal state management
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedPrompt, setSelectedPrompt] = useState(home.BASIC_PROMPT);
    const [paperCount, setPaperCount] = useState(10);
    const [customTemplate, setCustomTemplate] = useState(util.prompt_tmp);
    const [isMobile, setIsMobile] = useState(false);
    const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
    
    // Loading and results state
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPapers, setSelectedPapers] = useState<any[]>([]);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    
    // Preset template editing state
    const [editingPreset, setEditingPreset] = useState<string | null>(null);
    const [presetTemplates, setPresetTemplates] = useState({
        basic: "# Task\n{{ task }}\n\n# Output format\nAnswer Yes or No as labels\n\n# Prediction\nText: {{ text }}\nLabel:",
        detailed: "# Task\n{{ task }}\n\n# Instructions\nPlease analyze the provided reviews carefully and consider:\n- Overall sentiment and tone\n- Specific strengths and weaknesses mentioned\n- Consistency across reviewers\n- Quality of evidence and methodology\n\n# Output format\nAnswer Yes or No as labels\n\n# Prediction\nText: {{ text }}\nLabel:",
        structured: "# Task\n{{ task }}\n\n# Analysis Framework\n1. Review the overall feedback\n2. Identify key strengths\n3. Note major concerns\n4. Evaluate balance of positive vs negative\n\n# Output format\nAnswer Yes or No as labels\n\n# Prediction\nText: {{ text }}\nLabel:"
    });
    
    // Paper count options
    const paperCountOptions = [5, 10, 25, 50, 100];

    // Handle window resize for responsive design
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Ensure textarea is always editable - only when modal first opens
    useEffect(() => {
        if (showTemplateModal && !customTemplate) {
            setCustomTemplate(util.prompt_tmp.replace("{{ task }}", selectedPrompt));
        }
    }, [showTemplateModal]); // Remove selectedPrompt dependency

    // Simple onChange handler for template editing
    const handleCustomTemplateChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCustomTemplate(e.target.value);
    }, []);

    // Memoized prompt options with types
    const promptOptions = useMemo(() => {
        return home.PROMPT_TYPES.map((promptType, index) => ({
            id: index,
            prompt: promptType.prompt,
            type: promptType.type,
            label: `Type ${promptType.type} - ${promptType.prompt.substring(0, 100)}...`
        }));
    }, []);

    // Function to iterate through candidate prompts
    const handleNextPrompt = useCallback(() => {
        const nextIndex = (currentPromptIndex + 1) % home.PROMPT_CANDIDATES.length;
        setCurrentPromptIndex(nextIndex);
        const nextPrompt = home.PROMPT_CANDIDATES[nextIndex];
        setSelectedPrompt(nextPrompt);
        // Copy the new prompt template to textarea - user can continue editing
        const newTemplate = util.prompt_tmp.replace("{{ task }}", nextPrompt);
        setCustomTemplate(newTemplate);
    }, [currentPromptIndex]);

    // Function to get current prompt type
    const getCurrentPromptType = useCallback(() => {
        const promptType = home.PROMPT_TYPES.find(pt => pt.prompt === selectedPrompt);
        return promptType ? promptType.type : 'Custom';
    }, [selectedPrompt]);

    const handleTemplateEdit = useCallback(() => {
        setShowTemplateModal(true);
        // Always set the template when opening the modal
        setCustomTemplate(util.prompt_tmp.replace("{{ task }}", selectedPrompt));
    }, [selectedPrompt]);

    const handleTemplateConfirm = useCallback(async () => {
        if (customTemplate.trim()) {
            setIsLoading(true);
            try {
                // 1. Randomly select papers from the given year
                console.log('Fetching random papers...');
                const papers = await apiService.getRandomPapers(selectedYear, paperCount);
                setSelectedPapers(papers);
                console.log(`Selected ${papers.length} papers:`, papers);

                // 2. Run the API call to get predictions
                console.log('Running batch predictions...');
                const predictionResults = await apiService.runBatchPredictions(
                    papers, 
                    selectedPrompt, 
                    customTemplate, 
                    false // rebuttal = false for now
                );
                setPredictions(predictionResults);
                console.log('Prediction results:', predictionResults);

                // Show results
                setShowResults(true);
                setShowTemplateModal(false);
                
                // Success feedback
                alert(`Successfully processed ${papers.length} papers from ${selectedYear}! Check the results below.`);
                
            } catch (error) {
                console.error('Error in template confirmation:', error);
                alert(`Error: ${error instanceof Error ? error.message : 'Failed to process papers'}`);
            } finally {
                setIsLoading(false);
            }
        }
    }, [customTemplate, selectedYear, paperCount, selectedPrompt]);

    const handleResetTemplate = useCallback(() => {
        setCustomTemplate(util.prompt_tmp);
        setSelectedPrompt(home.BASIC_PROMPT);
        setCurrentPromptIndex(0);
    }, []);

    const handleLoadPreset = useCallback((presetType: string) => {
        const presetTemplate = presetTemplates[presetType as keyof typeof presetTemplates] || util.prompt_tmp;
        setCustomTemplate(presetTemplate);
    }, [presetTemplates]);

    const handleEditPreset = useCallback((presetType: string) => {
        setEditingPreset(presetType);
    }, []);

    const handleSavePreset = useCallback((presetType: string, template: string) => {
        setPresetTemplates(prev => ({
            ...prev,
            [presetType]: template
        }));
        setEditingPreset(null);
    }, []);

    const handleCancelEditPreset = useCallback(() => {
        setEditingPreset(null);
    }, []);

    // Template Modal Component - Memoized to prevent recreation
    const TemplateModal = React.memo(() => {
        if (!showTemplateModal) return null;

        // Preview the template with sample content
        const previewTemplate = customTemplate
            .replace("{{ task }}", selectedPrompt)
            .replace("{{ text }}", "Sample review content will appear here...");

        return (
            <div style={adminStyles.modal.overlay}>
                <div style={{
                    ...adminStyles.modal.container,
                    maxHeight: isMobile ? '98vh' : '95vh',
                    maxWidth: isMobile ? '95vw' : '80vw',
                    minWidth: isMobile ? '95vw' : '600px',
                    padding: isMobile ? '15px 20px' : '15px 30px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <h4 className="mb-4 text-center" style={{
                        ...adminStyles.modal.title,
                        fontSize: isMobile ? '1.1rem' : '1.25rem'
                    }}>
                        Template Editor
                    </h4>
                    
                    {/* Scrollable Content Container */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        paddingRight: '8px',
                        marginRight: '-8px'
                    }}>
                        {/* Year Selection */}
                        <div className="mb-4 d-flex align-items-center">
                            <label className="form-label fw-bold me-3 mb-0 py-0">Paper Source Year:</label>
                            <select
                                key="year-selection-dropdown"
                                className="form-select py-1"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                style={{...adminStyles.modal.textarea, width: '120px', minWidth: '120px'}}
                            >
                                {availableYears.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {/* Paper Count Selection */}
                        <div className="mb-4 d-flex align-items-center">
                            <label className="form-label fw-bold me-3 mb-0">Number of Papers:</label>
                          <input type="number" value={paperCount} onChange={(e) => setPaperCount(Number(e.target.value))} />
                        </div>
                        {/* Custom Template Editor */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Custom Template:</label>
                            <button
                                    className="btn btn-outline-primary btn-sm ms-4"
                                    onClick={handleNextPrompt}
                                    style={{
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        minWidth: '180px'
                                    }}
                                >
                                    <i className="fa fa-arrow-right"></i>
                                    Recommended ({currentPromptIndex + 1}/{home.PROMPT_CANDIDATES.length})
                            </button>
                            
                            {/* Preset Template Buttons */}
                            {/* <div className="mb-2">
                                <small className="text-muted me-2">Quick Presets:</small>
                                <div className="d-flex flex-wrap gap-1">
                                    <button 
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => handleLoadPreset('basic')}
                                    >
                                        Basic
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => handleLoadPreset('detailed')}
                                    >
                                        Detailed
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-outline-info"
                                        onClick={() => handleLoadPreset('structured')}
                                    >
                                        Structured
                                    </button>
                                    <button 
                                        className="btn btn-sm btn-outline-warning"
                                        onClick={handleResetTemplate}
                                    >
                                        Reset
                                    </button>
                                </div>
                            </div> */}
                            
                            <div style={adminStyles.modal.textareaContainer}>
                                <textarea
                                    key="custom-template-textarea"
                                    className="form-control"
                                    value={customTemplate}
                                    onChange={handleCustomTemplateChange}
                                    placeholder="Edit your custom template here..."
                                    autoFocus={true}
                                    style={{
                                        ...adminStyles.modal.textarea,
                                        minHeight: '150px',
                                        overflowY: 'auto',
                                        backgroundColor: '#ffffff'
                                    }}
                                />
                            </div>
                            <div style={adminStyles.infoMessage}>
                                Use {'{text}'} for the review content
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons - Fixed at Bottom */}
                    <div className="d-flex gap-3 justify-content-end mt-4 pt-3" style={{
                        borderTop: '1px solid #e9ecef',
                        backgroundColor: 'white'
                    }}>
                        <button 
                            className="btn btn-outline-secondary px-4 py-2" 
                            onClick={() => setShowTemplateModal(false)}
                            style={adminStyles.modal.button}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            className="btn btn-primary px-4 py-2" 
                            onClick={handleTemplateConfirm}
                            style={adminStyles.modal.submitButton}
                            disabled={!customTemplate.trim() || isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Processing...
                                </>
                            ) : (
                                'Run Prompt'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    });

    return (
        <div className="container-fluid py-4">
            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header border-0 py-3" style={adminStyles.table.header}>
                            <h4 className="mb-0 text-white">Prompt Template Editor</h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-12 col-lg-8">
                                    <p className="text-muted mb-4">
                                        Configure your prompt template, select the year and number of papers for batch processing. 
                                    </p>
                                    
                                    {/* Template Editor Button */}
                                    <div className="mb-4">
                                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                                            <button 
                                                className="btn btn-outline-primary px-4 py-2"
                                                onClick={handleTemplateEdit}
                                                style={{
                                                    borderRadius: '8px',
                                                    fontWeight: '500',
                                                    transition: 'all 0.3s ease',
                                                    minWidth: '200px'
                                                }}
                                            >
                                                <i className="fa fa-edit me-2"></i>
                                                Edit Template & Configure
                                            </button>
                                            <div className="text-muted small">
                                                Configure year, paper count, and customize your prompt template
                                            </div>
                                        </div>
                                    </div>
                                    {/* Current Prompt Display */}
                                    <div className="mb-4">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <h6 className="fw-bold mb-0">Current Prompt</h6>
                                                </div>
                                                <div 
                                                    className="form-control"
                                                    style={{
                                                        backgroundColor: '#f8f9fa',
                                                        color: '#495057',
                                                        minHeight: '80px',
                                                        overflowY: 'auto',
                                                        fontSize: '0.9rem',
                                                        whiteSpace: 'pre-wrap'
                                                    }}
                                                >
                                                    {selectedPrompt}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="col-12 col-lg-4 mt-4 mt-lg-0">
                                    <div className="card border-0 bg-light">
                                        <div className="card-body">
                                            <h6 className="fw-bold mb-3">Quick Actions</h6>
                                            <div className="d-grid gap-2">
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => setSelectedYear(currentYear)}
                                                >
                                                    Reset to Current Year
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={() => setPaperCount(10)}
                                                >
                                                    Reset Paper Count
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-secondary"
                                                    onClick={handleResetTemplate}
                                                >
                                                    Reset Template
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Results Section */}
                            {showResults && (
                                <div className="row mt-4">
                                    <div className="col-12">
                                        <div className="card border-0 bg-light">
                                            <div className="card-body">
                                                <h6 className="fw-bold mb-3">Processing Results</h6>
                                                
                                                {/* Selected Papers */}
                                                <div className="mb-4">
                                                    <h6 className="text-primary">Selected Papers ({selectedPapers.length})</h6>
                                                    <div className="table-responsive">
                                                        <table className="table table-sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>Title</th>
                                                                    <th>Authors</th>
                                                                    <th>Decision</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {selectedPapers.map((paper, index) => (
                                                                    <tr key={paper._id || index}>
                                                                        <td>{paper.title}</td>
                                                                        <td>{Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors}</td>
                                                                        <td>
                                                                            <span className={`badge ${paper.decision === 'Accept' ? 'bg-success' : 'bg-danger'}`}>
                                                                                {paper.decision || 'Unknown'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                {/* Predictions */}
                                                <div className="mb-4">
                                                    <h6 className="text-primary">Predictions ({predictions.length})</h6>
                                                    <div className="table-responsive">
                                                        <table className="table table-sm">
                                                            <thead>
                                                                <tr>
                                                                    <th>Paper ID</th>
                                                                    <th>Prompt</th>
                                                                    <th>Prediction</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {predictions.map((pred, index) => (
                                                                    <tr key={index}>
                                                                        <td>{pred.paper_id}</td>
                                                                        <td>{pred.prompt}</td>
                                                                        <td>
                                                                            <span className={`badge ${pred.prediction === 'Accept' ? 'bg-success' : pred.prediction === 'Reject' ? 'bg-danger' : 'bg-secondary'}`}>
                                                                                {pred.prediction || 'O'}
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>

                                                <button 
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => setShowResults(false)}
                                                >
                                                    Hide Results
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Template Modal */}
            <TemplateModal />
        </div>
    );
};

export default Prompting;
