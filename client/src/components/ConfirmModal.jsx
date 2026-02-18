import React from "react";
import Modal from "./Modal";
import "./ui.css";

/**
 * Reusable confirmation modal.
 * - message can be string or ReactNode
 * - variant: 'default' | 'danger'
 */
const ConfirmModal = ({
  isOpen,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const confirmClass = variant === "danger" ? "rzBtn rzBtnDanger" : "rzBtn rzBtnPrimary";

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="rzBtn rzBtnGhost" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className={confirmClass} onClick={onConfirm}>
            {confirmText}
          </button>
        </>
      }
    >
      <div className="rzConfirmBody">
        {typeof message === "string" ? <p className="rzConfirmText">{message}</p> : message}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
