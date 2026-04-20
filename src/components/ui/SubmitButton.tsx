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
  );
}
