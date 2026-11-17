import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...resto }: Props) {
  const identificador = id ?? resto.name;

  return (
    <div>
      <label
        htmlFor={identificador}
        className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <input
        id={identificador}
        {...resto}
        className={`w-full rounded-md border px-3 py-2 outline-none transition focus:border-amber-500 dark:bg-slate-800 ${
          error
            ? "border-red-500"
            : "border-slate-300 dark:border-slate-600"
        } ${className}`}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}