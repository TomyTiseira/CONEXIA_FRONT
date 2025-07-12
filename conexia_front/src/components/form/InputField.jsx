"use client";
import { Eye, EyeOff } from "lucide-react";

export default function InputField({
  type,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  error,
  showToggle = false,
  show = false,
  onToggle,
}) {
  return (
    <div className="min-h-[64/px] relative">
      <input
        type={show && type === "password" ? "text" : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring pr-10 ${
          error
            ? "border-red-500 ring-red-300"
            : "border-gray-300 focus:ring-conexia-green/40"
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-2.5 text-conexia-green"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
      <p className="text-xs text-red-600 mt-1 h-[30px]">{error}</p>
    </div>
  );
}