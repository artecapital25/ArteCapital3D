"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  loading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar eliminación",
  message,
  confirmText = "Eliminar",
  loading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="confirm-dialog animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon-wrapper">
          <AlertTriangle size={28} />
        </div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button
            type="button"
            className="confirm-btn confirm-btn-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="confirm-btn confirm-btn-danger"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Eliminando..." : confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .confirm-overlay {
          position: fixed;
          inset: 0;
          z-index: 110;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          padding: 1rem;
        }

        .confirm-dialog {
          width: 100%;
          max-width: 400px;
          background: linear-gradient(
            135deg,
            rgba(21, 21, 37, 0.98),
            rgba(14, 14, 26, 0.99)
          );
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-xl);
          padding: 2rem;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(239, 68, 68, 0.1);
        }

        .confirm-icon-wrapper {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: rgba(239, 68, 68, 0.12);
          color: #ef4444;
          border-radius: 50%;
          margin-bottom: 1rem;
        }

        .confirm-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .confirm-message {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .confirm-actions {
          display: flex;
          gap: 0.75rem;
        }

        .confirm-btn {
          flex: 1;
          padding: 0.625rem 1rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
          border: none;
        }

        .confirm-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .confirm-btn-cancel {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .confirm-btn-cancel:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .confirm-btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .confirm-btn-danger:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
      `}</style>
    </div>
  );
}
