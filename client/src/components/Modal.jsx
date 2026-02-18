import React, { useEffect } from "react";
import "./modal.css";

const Modal = ({ title, children, onClose, footer }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="rzModalOverlay" onMouseDown={onClose}>
      <div className="rzModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="rzModalHeader">
          <div className="rzModalTitle">{title}</div>
          <button className="rzModalClose" type="button" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="rzModalBody">{children}</div>

        {footer ? <div className="rzModalFooter">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
