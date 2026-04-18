"use client";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "number" | "email" | "tel" | "url" | "textarea" | "select";
  placeholder?: string;
  defaultValue?: string | number;
  error?: string;
  required?: boolean;
  step?: string;
  min?: string;
  max?: string;
  options?: { value: string; label: string }[];
  helpText?: string;
}

export default function FormField({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  error,
  required,
  step,
  min,
  max,
  options,
  helpText,
}: FormFieldProps) {
  const inputId = `field-${name}`;

  return (
    <div className="form-field">
      <label htmlFor={inputId} className="form-label">
        {label}
        {required && <span className="form-required">*</span>}
      </label>

      {type === "textarea" ? (
        <textarea
          id={inputId}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          className={`form-input form-textarea ${error ? "form-input-error" : ""}`}
          rows={3}
        />
      ) : type === "select" ? (
        <select
          id={inputId}
          name={name}
          defaultValue={defaultValue}
          required={required}
          className={`form-input form-select ${error ? "form-input-error" : ""}`}
        >
          <option value="">{placeholder || "Seleccionar..."}</option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={inputId}
          type={type}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          required={required}
          step={step}
          min={min}
          max={max}
          className={`form-input ${error ? "form-input-error" : ""}`}
        />
      )}

      {helpText && !error && (
        <span className="form-help">{helpText}</span>
      )}
      {error && <span className="form-error">{error}</span>}

      <style jsx>{`
        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .form-label {
          font-size: 0.8125rem;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .form-required {
          color: var(--accent-danger);
          margin-left: 0.25rem;
        }

        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 0.875rem;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(0, 180, 216, 0.12);
        }

        .form-input-error {
          border-color: var(--accent-danger) !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .form-select {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2rem;
        }

        .form-error {
          font-size: 0.75rem;
          color: var(--accent-danger);
          font-weight: 500;
        }

        .form-help {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
