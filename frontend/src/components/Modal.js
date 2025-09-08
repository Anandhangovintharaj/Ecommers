import React, { useState, useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false); // Reset isClosing when modal is closed externally
    }
  }, [isOpen]);

  if (!isOpen && !isClosing) return null; // Only render if isOpen or isClosing

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false); // Reset after animation
    }, 300); // Duration of fadeOut and slideOut animations
  };

  return (
    <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div className={`modal-content ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close-button" onClick={handleClose}>&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
