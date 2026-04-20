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
    </div>
  );
}
