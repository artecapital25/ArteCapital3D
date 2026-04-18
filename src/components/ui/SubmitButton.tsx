"use client";

interface SubmitButtonProps {
  loading?: boolean;
  text?: string;
  loadingText?: string;
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
}

export default function SubmitButton({
  loading = false,
  text = "Guardar",
  loadingText = "Guardando...",
  variant = "primary",
  fullWidth = true,
}: SubmitButtonProps) {
  return (
    <>
      <button
        type="submit"
        disabled={loading}
        className={`submit-btn submit-btn-${variant} ${fullWidth ? "submit-full" : ""}`}
      >
        {loading ? (
          <>
            <span className="submit-spinner" />
            {loadingText}
          </>
        ) : (
          text
        )}
      </button>

      <style jsx>{`
        .submit-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1.5rem;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 42px;
        }

        .submit-full {
          width: 100%;
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .submit-btn-primary {
          background: var(--gradient-primary);
          color: white;
        }

        .submit-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(0, 180, 216, 0.3),
            0 4px 15px rgba(233, 30, 140, 0.2);
        }

        .submit-btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .submit-btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-primary);
        }

        .submit-btn-danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .submit-btn-danger:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .submit-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
