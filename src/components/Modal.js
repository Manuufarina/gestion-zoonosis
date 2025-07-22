import React from 'react';

const Modal = ({ show, onClose, onConfirm, title, children }) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3 className="modal-title">{title}</h3>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          <button className="button button-secondary" onClick={onClose}>Cancelar</button>
          <button className="button button-danger" onClick={onConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
