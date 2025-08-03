import React from 'react';
import { adminStyles } from '../styles/adminStyles';

interface ConfirmationModalProps {
    showConfirmationModal: boolean;
    openModalPaper: any | null;
    confirmationPrompt: string;
    setConfirmationPrompt: (prompt: string) => void;
    user_rebuttal: boolean;
    setUserRebuttal: (rebuttal: boolean) => void;
    setShowConfirmationModal: (show: boolean) => void;
    onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    showConfirmationModal,
    openModalPaper,
    confirmationPrompt,
    setConfirmationPrompt,
    user_rebuttal,
    setUserRebuttal,
    setShowConfirmationModal,
    onConfirm
}) => {
    if (!showConfirmationModal || !openModalPaper) return null;

    return (
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
                <div className="form-check mb-3 d-flex align-items-center">
                    <input
                        className="form-check-input me-2"
                        type="checkbox"
                        id="rebuttalToggle"
                        checked={user_rebuttal}
                        onChange={() => setUserRebuttal(!user_rebuttal)}
                    />
                    <label className="form-check-label fw-bold text-danger mb-0" htmlFor="rebuttalToggle">
                        Rebuttal
                    </label>
                    {/* Info message for Rebuttal toggle */}
                    <div style={adminStyles.infoMessage} className="ms-2">
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
                        onClick={onConfirm}
                        style={adminStyles.modal.confirmSubmitButton}
                    >
                        Submit 
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal; 