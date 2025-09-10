/**
 * Feedback floating action button
 * Provides a floating button for users to submit feedback and bug reports
 */

import React, { useState } from 'react';
import { Bug, X, Send, AlertTriangle, Info, MessageSquare } from 'lucide-react';

interface FeedbackData {
  category: 'bug' | 'feature' | 'general';
  subject: string;
  description: string;
  steps: string;
  expected: string;
  actual: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  consent: boolean;
}

const initialFeedback: FeedbackData = {
  category: 'bug',
  subject: '',
  description: '',
  steps: '',
  expected: '',
  actual: '',
  severity: 'medium',
  consent: false,
};

export default function FeedbackFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>(initialFeedback);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedback),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFeedback(initialFeedback);
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof FeedbackData,
    value: string | boolean
  ) => {
    setFeedback(prev => ({ ...prev, [field]: value }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return <Bug className="w-4 h-4" />;
      case 'feature':
        return <MessageSquare className="w-4 h-4" />;
      case 'general':
        return <Info className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Submit feedback"
      >
        <Bug className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Feedback & Bug Report
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: 'bug',
                  label: 'Bug Report',
                  icon: <Bug className="w-4 h-4" />,
                },
                {
                  value: 'feature',
                  label: 'Feature Request',
                  icon: <MessageSquare className="w-4 h-4" />,
                },
                {
                  value: 'general',
                  label: 'General Feedback',
                  icon: <Info className="w-4 h-4" />,
                },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleInputChange('category', option.value)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-colors ${
                    feedback.category === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {option.icon}
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={feedback.subject}
              onChange={e => handleInputChange('subject', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of the issue or suggestion"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={feedback.description}
              onChange={e => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the issue or suggestion"
              required
            />
          </div>

          {/* Steps to Reproduce (for bugs) */}
          {feedback.category === 'bug' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steps to Reproduce
                </label>
                <textarea
                  value={feedback.steps}
                  onChange={e => handleInputChange('steps', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Result
                  </label>
                  <textarea
                    value={feedback.expected}
                    onChange={e =>
                      handleInputChange('expected', e.target.value)
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What should have happened"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Actual Result
                  </label>
                  <textarea
                    value={feedback.actual}
                    onChange={e => handleInputChange('actual', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What actually happened"
                  />
                </div>
              </div>

              {/* Severity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                    { value: 'critical', label: 'Critical' },
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleInputChange('severity', option.value)
                      }
                      className={`p-2 rounded-lg border transition-colors ${
                        feedback.severity === option.value
                          ? `${getSeverityColor(option.value)} border-current`
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Consent */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="consent"
              checked={feedback.consent}
              onChange={e => handleInputChange('consent', e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="consent" className="text-sm text-gray-700">
              I consent to being contacted about this feedback if additional
              information is needed.
            </label>
          </div>

          {/* Submit Status */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Thank you! Your feedback has been submitted.
              </span>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-medium">
                Failed to submit feedback. Please try again.
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !feedback.consent}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
