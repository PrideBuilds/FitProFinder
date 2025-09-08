/**
 * Featured Trainers Component (Refactored)
 * A refactored version using the new UI components and better structure
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Loading } from './ui';
import { trainersApi } from '../utils/api';
import type { Trainer } from '../types';

interface FeaturedTrainersProps {
  limit?: number;
  showLoadMore?: boolean;
  onTrainerSelect?: (trainer: Trainer) => void;
  className?: string;
}

const FeaturedTrainers: React.FC<FeaturedTrainersProps> = ({
  limit = 6,
  showLoadMore = true,
  onTrainerSelect,
  className = '',
}) => {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, [limit]);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await trainersApi.getFeatured(limit);
      
      if (response.success && response.data) {
        setTrainers(response.data.trainers || []);
        setHasMore(response.data.hasMore || false);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch trainers');
      }
    } catch (err) {
      console.error('Error fetching featured trainers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch trainers');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      setLoading(true);
      
      const response = await trainersApi.getFeatured(limit * 2);
      
      if (response.success && response.data) {
        setTrainers(response.data.trainers || []);
        setHasMore(response.data.hasMore || false);
      }
    } catch (err) {
      console.error('Error loading more trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTrainerClick = (trainer: Trainer) => {
    onTrainerSelect?.(trainer);
  };

  if (loading && trainers.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Trainers
          </h2>
          <p className="text-gray-600 mb-8">
            Discover top-rated fitness professionals in your area
          </p>
        </div>
        <Loading size="lg" text="Loading featured trainers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Trainers
          </h2>
          <p className="text-gray-600 mb-8">
            Discover top-rated fitness professionals in your area
          </p>
        </div>
        <Card className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to Load Trainers
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchTrainers} variant="primary">
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  if (trainers.length === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Trainers
          </h2>
          <p className="text-gray-600 mb-8">
            Discover top-rated fitness professionals in your area
          </p>
        </div>
        <Card className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Trainers Available
          </h3>
          <p className="text-gray-600">
            Check back later for featured trainers in your area.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Featured Trainers
        </h2>
        <p className="text-gray-600 mb-8">
          Discover top-rated fitness professionals in your area
        </p>
      </div>

      {/* Trainers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainers.map((trainer) => (
          <TrainerCard
            key={trainer.id}
            trainer={trainer}
            onClick={() => handleTrainerClick(trainer)}
          />
        ))}
      </div>

      {/* Load More Button */}
      {showLoadMore && hasMore && (
        <div className="text-center">
          <Button
            onClick={handleLoadMore}
            variant="outline"
            size="lg"
            loading={loading}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Trainers'}
          </Button>
        </div>
      )}
    </div>
  );
};

// Trainer Card Component
interface TrainerCardProps {
  trainer: Trainer;
  onClick: () => void;
}

const TrainerCard: React.FC<TrainerCardProps> = ({ trainer, onClick }) => {
  const {
    id,
    firstName,
    lastName,
    businessName,
    bio,
    experienceYears,
    location,
    rating,
    reviewCount,
    isVerified,
    profileImageUrl,
    specialties,
    offersOnline,
    offersInPerson,
  } = trainer;

  const fullName = `${firstName} ${lastName}`;
  const businessDisplayName = businessName || fullName;

  return (
    <Card
      className="group cursor-pointer hover:shadow-lg transition-all duration-200"
      onClick={onClick}
      clickable
    >
      {/* Profile Image */}
      <div className="relative mb-4">
        <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={fullName}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">
                {firstName.charAt(0)}{lastName.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute top-2 right-2">
            <div className="bg-green-500 text-white p-1 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Name and Business */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {fullName}
          </h3>
          {businessName && (
            <p className="text-sm text-gray-600">{businessName}</p>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{location.city}, {location.state}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm text-gray-600">
            {rating.toFixed(1)} ({reviewCount} reviews)
          </span>
        </div>

        {/* Experience */}
        <div className="text-sm text-gray-600">
          {experienceYears} years experience
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1">
          {specialties.slice(0, 3).map((specialty) => (
            <span
              key={specialty}
              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
          {specialties.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{specialties.length - 3} more
            </span>
          )}
        </div>

        {/* Session Types */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {offersOnline && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Online
            </div>
          )}
          {offersInPerson && (
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              In-Person
            </div>
          )}
        </div>

        {/* Bio Preview */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {bio}
        </p>
      </div>
    </Card>
  );
};

export default FeaturedTrainers;
