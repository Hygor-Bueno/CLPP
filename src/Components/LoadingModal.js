import React from 'react';
import './LoadingModal.css';

export default function LoadingModal(props) {
    if (props.loading) {
        return (
            <div className="loading-modal">
                <div className="loading-spinner"></div>
            </div>
        );
    }
}