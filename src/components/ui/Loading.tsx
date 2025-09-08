/**
 * Loading Component
 * A reusable loading component with multiple variants
 */

import React from 'react';
import type { LoadingProps } from '../../types/components';

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  text,
  overlay = false,
  spinner = true,
  skeleton = false,
  className = '',
  ...props
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };
  
  // Spinner component
  const Spinner = () => (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
  
  // Skeleton component
  const Skeleton = () => (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded h-4 w-full mb-2"></div>
      <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 rounded h-4 w-1/2"></div>
    </div>
  );
  
  // Dots component
  const Dots = () => (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
  
  // Pulse component
  const Pulse = () => (
    <div className="animate-pulse">
      <div className="bg-current rounded-full h-full w-full"></div>
    </div>
  );
  
  // Loading content
  const LoadingContent = () => {
    if (skeleton) return <Skeleton />;
    if (spinner) return <Spinner />;
    return <Dots />;
  };
  
  // Overlay wrapper
  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <LoadingContent />
          {text && (
            <p className="mt-2 text-sm text-gray-600">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }
  
  // Regular loading
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <div className="text-center">
        <LoadingContent />
        {text && (
          <p className="mt-2 text-sm text-gray-600">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
