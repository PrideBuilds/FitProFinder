/**
 * Input Component
 * A reusable input component with validation and error states
 */

import React, { forwardRef } from 'react';
import type { InputProps } from '../../types/components';

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = 'text',
      placeholder,
      value,
      defaultValue,
      onChange,
      onBlur,
      onFocus,
      disabled = false,
      required = false,
      error,
      label,
      helperText,
      icon,
      iconPosition = 'left',
      className = '',
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      'block w-full rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0';

    // State classes
    const stateClasses = error
      ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500';

    // Disabled classes
    const disabledClasses = disabled
      ? 'bg-gray-50 cursor-not-allowed'
      : 'bg-white';

    // Icon classes
    const iconClasses = icon
      ? iconPosition === 'left'
        ? 'pl-10'
        : 'pr-10'
      : '';

    // Input classes
    const inputClasses =
      `${baseClasses} ${stateClasses} ${disabledClasses} ${iconClasses} px-3 py-2 text-sm ${className}`.trim();

    // Icon component
    const Icon = () => {
      if (!icon) return null;
      return (
        <div
          className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}
        >
          <span className="text-gray-400">{icon}</span>
        </div>
      );
    };

    // Error message
    const ErrorMessage = () => {
      if (!error) return null;
      return <p className="mt-1 text-sm text-red-600">{error}</p>;
    };

    // Helper text
    const HelperText = () => {
      if (!helperText || error) return null;
      return <p className="mt-1 text-sm text-gray-500">{helperText}</p>;
    };

    // Label
    const Label = () => {
      if (!label) return null;
      return (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      );
    };

    return (
      <div className="w-full">
        <Label />
        <div className="relative">
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onChange={e => onChange?.(e.target.value)}
            onBlur={onBlur}
            onFocus={onFocus}
            disabled={disabled}
            required={required}
            className={inputClasses}
            {...props}
          />
          <Icon />
        </div>
        <HelperText />
        <ErrorMessage />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
