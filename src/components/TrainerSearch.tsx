import React, { useState, useEffect } from 'react';
import { trainersApi } from '../utils/api';
import type { SearchFilters, SearchResult, Trainer } from '../types';

// Demo data - same as what we used for FeaturedTrainers
const DEMO_TRAINERS: Trainer[] = [
  {
    id: '1',
    email: 'sarah.johnson@email.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0101',
    isVerified: true,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-01-15'),
    businessName: 'FitWise LA',
    specialties: ['Personal Training', 'Weight Loss', 'Strength Training'],
    bio: 'Certified personal trainer with 8 years of experience helping clients achieve their fitness goals through customized workout programs and nutrition guidance.',
    experienceYears: 8,
    certifications: [
      {
        name: 'NASM-CPT',
        organization: 'NASM',
        dateObtained: new Date('2016-03-01'),
      },
      {
        name: 'Nutrition Coach',
        organization: 'NASM',
        dateObtained: new Date('2018-06-01'),
      },
    ],
    location: {
      address: '123 Fitness Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US',
    },
    rating: 4.8,
    reviewCount: 127,
    subscriptionTier: 'premium',
    isAcceptingClients: true,
    offersOnline: true,
    offersInPerson: true,
  },
  {
    id: '2',
    email: 'mike.chen@email.com',
    firstName: 'Mike',
    lastName: 'Chen',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0102',
    isVerified: true,
    createdAt: new Date('2022-08-10'),
    updatedAt: new Date('2024-01-10'),
    businessName: 'Zen Fitness SF',
    specialties: ['Yoga', 'Meditation', 'Pilates'],
    bio: 'Holistic wellness coach specializing in mind-body connection. 6 years of experience in yoga instruction and mindfulness practices.',
    experienceYears: 6,
    location: {
      address: '456 Wellness St',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'US',
    },
    rating: 4.9,
    reviewCount: 89,
    subscriptionTier: 'basic',
    isAcceptingClients: true,
    offersOnline: true,
    offersInPerson: true,
  },
  {
    id: '3',
    email: 'jessica.rodriguez@email.com',
    firstName: 'Jessica',
    lastName: 'Rodriguez',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0103',
    isVerified: true,
    createdAt: new Date('2023-03-20'),
    updatedAt: new Date('2024-01-20'),
    businessName: 'NutriStrong Austin',
    specialties: ['Nutrition Coaching', 'Weight Loss', 'Sports Nutrition'],
    bio: 'Registered dietitian and certified trainer with expertise in nutrition and body composition. Helping clients for 5 years.',
    experienceYears: 5,
    location: {
      address: '789 Health Blvd',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      country: 'US',
    },
    rating: 4.7,
    reviewCount: 156,
    subscriptionTier: 'premium',
    isAcceptingClients: true,
    offersOnline: true,
    offersInPerson: true,
  },
  {
    id: '4',
    email: 'alex.thompson@email.com',
    firstName: 'Alex',
    lastName: 'Thompson',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0104',
    isVerified: true,
    createdAt: new Date('2021-11-05'),
    updatedAt: new Date('2024-01-05'),
    businessName: 'Elite HIIT Miami',
    specialties: ['HIIT', 'Cardio', 'Military Fitness'],
    bio: 'Former military fitness instructor with 10 years of experience in high-intensity training and functional fitness.',
    experienceYears: 10,
    location: {
      address: '321 Beach Rd',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'US',
    },
    rating: 4.6,
    reviewCount: 203,
    subscriptionTier: 'basic',
    isAcceptingClients: true,
    offersOnline: true,
    offersInPerson: true,
  },
  {
    id: '5',
    email: 'david.wilson@email.com',
    firstName: 'David',
    lastName: 'Wilson',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0105',
    isVerified: true,
    createdAt: new Date('2020-06-12'),
    updatedAt: new Date('2024-01-12'),
    businessName: 'Peak Performance Denver',
    specialties: [
      'Sports Performance',
      'Strength Training',
      'Injury Prevention',
    ],
    bio: 'Sports performance specialist working with athletes and fitness enthusiasts. 12 years of experience in strength and conditioning.',
    experienceYears: 12,
    location: {
      address: '654 Mountain View Ave',
      city: 'Denver',
      state: 'CO',
      zipCode: '80202',
      country: 'US',
    },
    rating: 4.9,
    reviewCount: 178,
    subscriptionTier: 'premium',
    isAcceptingClients: true,
    offersOnline: true,
    offersInPerson: true,
  },
  {
    id: '6',
    email: 'lisa.martinez@email.com',
    firstName: 'Lisa',
    lastName: 'Martinez',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0106',
    isVerified: true,
    createdAt: new Date('2022-04-08'),
    updatedAt: new Date('2024-01-08'),
    businessName: 'Recovery Plus Seattle',
    specialties: ['Injury Recovery', 'Corrective Exercise', 'Physical Therapy'],
    bio: 'Licensed physical therapist and corrective exercise specialist. 7 years helping clients recover and prevent injuries.',
    experienceYears: 7,
    location: {
      address: '987 Wellness Way',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'US',
    },
    rating: 4.8,
    reviewCount: 134,
    subscriptionTier: 'basic',
    isAcceptingClients: true,
    offersOnline: true,
    offersInPerson: true,
  },
  // Add some additional trainers for search variety
  {
    id: '7',
    email: 'marcus.rodriguez@email.com',
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0107',
    isVerified: false,
    createdAt: new Date('2023-09-15'),
    updatedAt: new Date('2024-01-15'),
    businessName: 'Boxing Basics NYC',
    specialties: ['Boxing', 'HIIT', 'Cardio'],
    bio: 'Professional boxing trainer with 6 years of experience. Focus on technique, conditioning, and self-defense.',
    experienceYears: 6,
    location: {
      address: '100 Broadway',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    rating: 4.5,
    reviewCount: 67,
    subscriptionTier: 'free',
    isAcceptingClients: true,
    offersOnline: false,
    offersInPerson: true,
  },
  {
    id: '8',
    email: 'stephanie.kim@email.com',
    firstName: 'Stephanie',
    lastName: 'Kim',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0108',
    isVerified: true,
    createdAt: new Date('2023-02-28'),
    updatedAt: new Date('2024-01-28'),
    businessName: 'Dance Fit Chicago',
    specialties: ['Dance Fitness', 'Cardio', 'Group Classes'],
    bio: 'Dance instructor and fitness coach bringing fun to workouts. 4 years of experience in dance fitness and choreography.',
    experienceYears: 4,
    location: {
      address: '200 Lake Shore Dr',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
    },
    rating: 4.7,
    reviewCount: 92,
    subscriptionTier: 'basic',
    isAcceptingClients: true,
    offersOnline: true,
    offersInPerson: true,
  },
  {
    id: '9',
    email: 'robert.taylor@email.com',
    firstName: 'Robert',
    lastName: 'Taylor',
    role: 'trainer',
    profileImageUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    phoneNumber: '+1-555-0109',
    isVerified: true,
    createdAt: new Date('2022-01-10'),
    updatedAt: new Date('2024-01-10'),
    businessName: 'CrossFit Phoenix',
    specialties: ['CrossFit', 'Olympic Lifting', 'Functional Fitness'],
    bio: 'CrossFit Level 2 trainer with 9 years of experience in functional fitness and competitive training.',
    experienceYears: 9,
    location: {
      address: '300 Desert Rd',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'US',
    },
    rating: 4.8,
    reviewCount: 145,
    subscriptionTier: 'premium',
    isAcceptingClients: true,
    offersOnline: false,
    offersInPerson: true,
  },
];

// Helper function to filter trainers based on search criteria
function filterTrainers(
  trainers: Trainer[],
  filters: Partial<SearchFilters>
): Trainer[] {
  return trainers.filter(trainer => {
    // City filter
    if (
      filters.city &&
      !trainer.location.city.toLowerCase().includes(filters.city.toLowerCase())
    ) {
      return false;
    }

    // State filter
    if (
      filters.state &&
      !trainer.location.state
        .toLowerCase()
        .includes(filters.state.toLowerCase())
    ) {
      return false;
    }

    // Specialties filter
    if (filters.specialties && filters.specialties.length > 0) {
      const hasMatchingSpecialty = filters.specialties.some(filterSpecialty =>
        trainer.specialties.some(trainerSpecialty =>
          trainerSpecialty.toLowerCase().includes(filterSpecialty.toLowerCase())
        )
      );
      if (!hasMatchingSpecialty) return false;
    }

    // Rating filter
    if (filters.rating && trainer.rating < filters.rating) {
      return false;
    }

    // Verified filter
    if (filters.verified && !trainer.isVerified) {
      return false;
    }

    return true;
  });
}

// Helper function to create paginated results
function paginateTrainers(
  trainers: Trainer[],
  page: number = 1,
  limit: number = 9
): SearchResult {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedTrainers = trainers.slice(startIndex, endIndex);

  const totalPages = Math.ceil(trainers.length / limit);

  return {
    trainers: paginatedTrainers,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount: trainers.length,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      limit,
    },
  };
}

interface TrainerSearchProps {
  initialFilters?: Partial<SearchFilters>;
}

export default function TrainerSearch({
  initialFilters = {},
}: TrainerSearchProps) {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse URL parameters and merge with initial filters
  const getFiltersFromURL = (): Partial<SearchFilters> => {
    if (typeof window === 'undefined') return initialFilters;

    const urlParams = new URLSearchParams(window.location.search);
    const urlFilters: Partial<SearchFilters> = {};

    // Get city from URL
    const city = urlParams.get('city');
    if (city) urlFilters.city = city;

    // Get state from URL
    const state = urlParams.get('state');
    if (state) urlFilters.state = state;

    // Get specialty from URL
    const specialty = urlParams.get('specialty');
    if (specialty) urlFilters.specialties = [specialty];

    // Get rating from URL
    const rating = urlParams.get('rating');
    if (rating) urlFilters.rating = parseFloat(rating);

    // Get verified filter from URL
    const verified = urlParams.get('verified');
    if (verified === 'true') urlFilters.verified = true;

    return { ...initialFilters, ...urlFilters };
  };

  const [filters, setFilters] =
    useState<Partial<SearchFilters>>(getFiltersFromURL());

  // Load trainers using demo data
  const loadTrainers = async (currentFilters: Partial<SearchFilters>) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Filter and paginate demo data
      const filteredTrainers = filterTrainers(DEMO_TRAINERS, currentFilters);
      const results = paginateTrainers(
        filteredTrainers,
        currentFilters.page || 1,
        currentFilters.limit || 9
      );

      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trainers');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadTrainers(filters);
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadTrainers(updatedFilters);

    // Update URL with new filters
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value) && value.length > 0) {
            urlParams.set(key, value[0].toString());
          } else if (typeof value === 'string' && value !== '') {
            urlParams.set(key, value);
          } else if (typeof value === 'number' || typeof value === 'boolean') {
            urlParams.set(key, value.toString());
          }
        }
      });

      const newUrl = `/search${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);
    loadTrainers(updatedFilters);
  };

  if (isLoading && !searchResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            {/* Loading skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
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
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Error Loading Trainers
            </h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => loadTrainers(filters)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Trainer
          </h1>
          <p className="text-gray-600">
            {searchResults?.pagination.totalCount || 0} trainers found
            {/* Show active filters */}
            {(filters.city ||
              filters.state ||
              filters.specialties?.length ||
              filters.rating ||
              filters.verified) && (
              <span className="ml-2">matching your filters</span>
            )}
          </p>

          {/* Active Filters Display */}
          {(filters.city ||
            filters.state ||
            filters.specialties?.length ||
            filters.rating ||
            filters.verified) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Active filters:</span>

              {filters.city && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📍 {filters.city}
                  <button
                    onClick={() => handleFilterChange({ city: undefined })}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.state && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📍 {filters.state}
                  <button
                    onClick={() => handleFilterChange({ state: undefined })}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.specialties?.map((specialty, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                >
                  {specialty}
                  <button
                    onClick={() =>
                      handleFilterChange({ specialties: undefined })
                    }
                    className="ml-1 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}

              {filters.rating && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  ⭐ {filters.rating}+ rating
                  <button
                    onClick={() => handleFilterChange({ rating: undefined })}
                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                  >
                    ×
                  </button>
                </span>
              )}

              {filters.verified && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  ✓ Verified only
                  <button
                    onClick={() => handleFilterChange({ verified: undefined })}
                    className="ml-1 text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  setFilters({});
                  loadTrainers({});
                  if (typeof window !== 'undefined') {
                    window.history.replaceState({}, '', '/search');
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Search Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="City, State"
                value={
                  filters.city && filters.state
                    ? `${filters.city}, ${filters.state}`
                    : filters.city || ''
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={e => {
                  const [city, state] = e.target.value
                    .split(',')
                    .map(s => s.trim());
                  handleFilterChange({
                    city: city || undefined,
                    state: state || undefined,
                  });
                }}
              />
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <select
                value={filters.specialties?.[0] || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={e =>
                  handleFilterChange({
                    specialties: e.target.value ? [e.target.value] : undefined,
                  })
                }
              >
                <option value="">All Specialties</option>
                <option value="Personal Training">Personal Training</option>
                <option value="Yoga">Yoga</option>
                <option value="Nutrition Coaching">Nutrition</option>
                <option value="Strength Training">Strength Training</option>
                <option value="HIIT">HIIT</option>
                <option value="Cardio Training">Cardio</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="Sports Performance">Sports Performance</option>
                <option value="Injury Recovery">Injury Recovery</option>
                <option value="Boxing">Boxing</option>
                <option value="Dance Fitness">Dance Fitness</option>
                <option value="CrossFit">CrossFit</option>
                <option value="Olympic Lifting">Olympic Lifting</option>
                <option value="Functional Fitness">Functional Fitness</option>
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rating
              </label>
              <select
                value={filters.rating || ''}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={e =>
                  handleFilterChange({
                    rating: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
              >
                <option value="">Any Rating</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
              </select>
            </div>

            {/* Verified Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verified Only
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.verified || false}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  onChange={e =>
                    handleFilterChange({
                      verified: e.target.checked || undefined,
                    })
                  }
                />
                <span className="ml-2 text-sm text-gray-600">
                  Show verified trainers only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {searchResults?.trainers.map(trainer => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>

        {/* Pagination */}
        {searchResults && searchResults.pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  handlePageChange(searchResults.pagination.currentPage - 1)
                }
                disabled={!searchResults.pagination.hasPrevPage}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <span className="px-4 py-2 text-gray-700">
                Page {searchResults.pagination.currentPage} of{' '}
                {searchResults.pagination.totalPages}
              </span>

              <button
                onClick={() =>
                  handlePageChange(searchResults.pagination.currentPage + 1)
                }
                disabled={!searchResults.pagination.hasNextPage}
                className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {isLoading && searchResults && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

// Trainer Card Component
function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex items-center space-x-4 mb-4">
        <img
          src={
            trainer.profileImageUrl ||
            `https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop&crop=face`
          }
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

      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{trainer.bio}</p>

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
        <a
          href={`/trainers/${trainer.id}`}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium text-center"
        >
          View Profile
        </a>
        <button
          onClick={() => {
            // For now, just scroll to top and show a simple alert
            // In the future, this would open a messaging modal or navigate to a messaging page
            window.scrollTo({ top: 0, behavior: 'smooth' });
            alert(
              `Message feature coming soon! You can contact ${trainer.firstName} ${trainer.lastName} at their profile page.`
            );
          }}
          className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
        >
          Message
        </button>
      </div>
    </div>
  );
}
