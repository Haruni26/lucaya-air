"use client";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input
        className={`field-input ${className}`}
        style={error ? { borderColor: "var(--color-coral)" } : {}}
        {...props}
      />
      {error && (
        <p
          className="text-xs mt-1"
          style={{
            color: "var(--color-coral)",
            fontFamily: "var(--font-body)",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
