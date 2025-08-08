import React from 'react';
import { adminStyles } from '../styles/adminStyles';

interface RebuttalToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    label?: string;
    showInfoMessage?: boolean;
}

const RebuttalToggle: React.FC<RebuttalToggleProps> = ({
    checked,
    onChange,
    disabled = false,
    className = '',
    label = 'Rebuttal',
    showInfoMessage = false
}) => {
    return (
        <div className={`form-check form-switch ${className}`} style={{ margin: 0 }}>
            <input
                className="form-check-input"
                type="checkbox"
                id="rebuttalSwitch"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                disabled={disabled}
                style={adminStyles.form.switch}
            />
            <label 
                className={checked ? "form-check-label text-primary" : "form-check-label text-success"} 
                htmlFor="rebuttalSwitch" 
                style={adminStyles.form.switchLabel}
            >
                <b>{label}</b>
            </label>
            {showInfoMessage && (
                <div style={adminStyles.infoMessage} className="ms-2">
                    {checked
                        ? 'Rebuttal Included in {text}'
                        : ''}
                </div>
            )}
        </div>
    );
};

export default RebuttalToggle; 