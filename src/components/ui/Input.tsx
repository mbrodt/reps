import { forwardRef, type InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = '', id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-3 py-2 
            border border-gray-300 rounded-lg
            text-base
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';
