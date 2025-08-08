import React from 'react';
import { adminStyles } from '../styles/adminStyles';

interface PromptInputModalProps {
    openModalPaper: any | null;
    userPrompt: string;
    setUserPrompt: (prompt: string) => void;
    currentPrompt: string;
    setOpenModalPaper: (paper: any | null) => void;
    onConfirm: () => void;
}

const PromptInputModal: React.FC<PromptInputModalProps> = ({
    openModalPaper,
    userPrompt,
    setUserPrompt,
    currentPrompt,
    setOpenModalPaper,
    onConfirm
}) => {
    if (!openModalPaper) return null;

    return (
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
                        onClick={onConfirm}
                        style={adminStyles.modal.submitButton}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PromptInputModal; 