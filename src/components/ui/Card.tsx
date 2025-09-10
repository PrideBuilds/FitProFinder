/**
 * Card Component
 * A reusable card component with multiple variants
 */

import React from 'react';
import type { CardProps } from '../../types/components';

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  hover = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'rounded-lg border transition-all duration-200';

  // Variant classes
  const variantClasses = {
    default: 'bg-white border-gray-200',
    outlined: 'bg-white border-gray-300',
    elevated: 'bg-white border-gray-200 shadow-md',
    filled: 'bg-gray-50 border-gray-200',
  };

  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  // Interactive classes
  const interactiveClasses = clickable
    ? 'cursor-pointer hover:shadow-md active:scale-[0.98]'
    : hover
      ? 'hover:shadow-md'
      : '';

  // Combine classes
  const classes =
    `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${interactiveClasses} ${className}`.trim();

  return (
    <div
      className={classes}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
