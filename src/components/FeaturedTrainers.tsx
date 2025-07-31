import React, { useState, useEffect } from 'react';
import { trainersApi } from '../utils/api';
import type { Trainer } from '../types';

export default function FeaturedTrainers() {
  // Test data for debugging
  const testTrainers = [
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      businessName: 'Sarah Johnson Fitness',
      bio: 'Certified personal trainer with 8 years of experience helping clients achieve their fitness goals through personalized strength training and weight loss programs.',
      experienceYears: 8,
      location: {
        address: '123 Fitness Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210'
      },
      rating: 4.8,
      reviewCount: 42,
      isVerified: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=150&h=150&fit=crop&crop=face',
      specialties: ['Personal Training', 'Weight Loss', 'Strength Training'],
      subscriptionTier: 'premium',
      isAcceptingClients: true,
      offersOnline: true,
      offersInPerson: true
    },
    {
      id: '2',
      firstName: 'Mike',
      lastName: 'Chen',
      businessName: 'Zen Yoga Studio',
      bio: 'Experienced yoga instructor and wellness coach helping people find balance through mindful movement and meditation practices.',
      experienceYears: 6,
      location: {
        address: '456 Wellness St',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102'
      },
      rating: 4.9,
      reviewCount: 38,
      isVerified: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      specialties: ['Yoga', 'Meditation', 'Pilates'],
      subscriptionTier: 'basic',
      isAcceptingClients: true,
      offersOnline: false,
      offersInPerson: true
    },
    {
      id: '3',
      firstName: 'Jessica',
      lastName: 'Rodriguez',
      businessName: 'NutriCore Coaching',
      bio: 'Registered dietitian and certified nutrition coach specializing in sustainable weight loss and performance nutrition for athletes.',
      experienceYears: 5,
      location: {
        address: '789 Health Blvd',
        city: 'Austin',
        state: 'TX',
        zipCode: '73301'
      },
      rating: 4.7,
      reviewCount: 29,
      isVerified: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
      specialties: ['Nutrition Coaching', 'Weight Loss', 'Sports Nutrition'],
      subscriptionTier: 'premium',
      isAcceptingClients: true,
      offersOnline: true,
      offersInPerson: true
    },
    {
      id: '4',
      firstName: 'Alex',
      lastName: 'Thompson',
      businessName: 'HIIT Zone Miami',
      bio: 'High-intensity interval training specialist and former military fitness instructor. Expert in fat burning and cardiovascular conditioning.',
      experienceYears: 10,
      location: {
        address: '321 Ocean Dr',
        city: 'Miami',
        state: 'FL',
        zipCode: '33139'
      },
      rating: 4.6,
      reviewCount: 56,
      isVerified: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=face',
      specialties: ['HIIT', 'Cardio', 'Military Fitness'],
      subscriptionTier: 'basic',
      isAcceptingClients: true,
      offersOnline: true,
      offersInPerson: true
    },
    {
      id: '5',
      firstName: 'David',
      lastName: 'Wilson',
      businessName: 'Peak Performance Lab',
      bio: 'Sports performance coach working with professional athletes and weekend warriors. Specializing in functional movement and injury prevention.',
      experienceYears: 12,
      location: {
        address: '654 Mountain View',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202'
      },
      rating: 4.9,
      reviewCount: 73,
      isVerified: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face',
      specialties: ['Sports Performance', 'Strength Training', 'Injury Prevention'],
      subscriptionTier: 'premium',
      isAcceptingClients: true,
      offersOnline: false,
      offersInPerson: true
    },
    {
      id: '6',
      firstName: 'Lisa',
      lastName: 'Martinez',
      businessName: 'Recovery & Wellness Center',
      bio: 'Physical therapist and corrective exercise specialist helping clients recover from injuries and improve movement quality.',
      experienceYears: 7,
      location: {
        address: '987 Pine St',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101'
      },
      rating: 4.8,
      reviewCount: 34,
      isVerified: true,
      profileImageUrl: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=face',
      specialties: ['Injury Recovery', 'Corrective Exercise', 'Physical Therapy'],
      subscriptionTier: 'premium',
      isAcceptingClients: true,
      offersOnline: true,
      offersInPerson: true
    }
  ];

  const [trainers, setTrainers] = useState<Trainer[]>(testTrainers as any);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Temporarily disable API call for debugging
  useEffect(() => {
    console.log('FeaturedTrainers component mounted');
    console.log('Trainers state:', trainers);
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 mb-2">Unable to Load Trainers</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {trainers.map((trainer) => (
        <div 
          key={trainer.id} 
          className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => window.location.href = `/trainers/${trainer.id}`}
        >
          <div className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <img
                src={trainer.profileImageUrl || `https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face`}
                alt={`${trainer.firstName} ${trainer.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {trainer.firstName} {trainer.lastName}
                  </h3>
                  {trainer.isVerified && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm">{trainer.businessName}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="text-sm text-gray-600 ml-1">
                      {trainer.rating.toFixed(1)} ({trainer.reviewCount} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
              {trainer.bio}
            </p>
            
            <div className="mb-4">
              <div className="flex flex-wrap gap-1">
                {trainer.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
                {trainer.specialties.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                    +{trainer.specialties.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                📍 {trainer.location.city}, {trainer.location.state}
              </div>
              <div className="text-sm text-gray-600">
                {trainer.experienceYears} years exp.
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/trainers/${trainer.id}`;
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View Profile
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = `/messages?trainer=${trainer.id}`;
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Message
              </button>
            </div>
          </div>
        </div>
      ))}
      
      <div className="col-span-full text-center mt-8">
        <a 
          href="/search" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          View All Trainers
          <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  );
} 