/**
 * Modal Component
 * A reusable modal component with multiple sizes and animations
 */

import React, { useEffect, useRef } from 'react';
import type { ModalProps } from '../../types/components';

const Modal: React.FC<ModalProps> = ({
  children,
  isOpen,
  onClose,
  title,
  size = 'md',
  closable = true,
  overlay = true,
  animation = 'fade',
  className = '',
  ...props
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Animation classes
  const animationClasses = {
    fade: 'animate-fade-in',
    slide: 'animate-slide-in',
    zoom: 'animate-zoom-in',
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closable, onClose]);

  // Handle click outside
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && closable) {
      onClose();
    }
  };

  // Close button
  const CloseButton = () => {
    if (!closable) return null;

    return (
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close modal"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    );
  };

  // Modal header
  const ModalHeader = () => {
    if (!title) return null;

    return (
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
    );
  };

  // Modal content
  const ModalContent = () => <div className="px-6 py-4">{children}</div>;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      {overlay && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={handleOverlayClick}
        />
      )}

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} ${animationClasses[animation]} ${className}`}
          {...props}
        >
          <CloseButton />
          <ModalHeader />
          <ModalContent />
        </div>
      </div>
    </div>
  );
};

export default Modal;
