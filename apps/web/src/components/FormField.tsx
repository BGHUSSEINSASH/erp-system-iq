import { useId } from "react";

type Props = {
  label: string;
  value: string | number;
  type?: string;
  options?: { label: string; value: string }[];
  onChange: (val: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
};

export default function FormField({ label, value, type = "text", options, onChange, required, disabled, placeholder, rows = 3 }: Props) {
  const id = useId();

  if (type === "select" && options) {
    return (
      <div className="form-field">
        <label htmlFor={id}>{label}</label>
        <select id={id} value={String(value)} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled}>
          <option value="">-- اختر / Select --</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="form-field">
        <label htmlFor={id}>{label}</label>
        <textarea
          id={id}
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
        />
      </div>
    );
  }

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
}
