import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'FitProFinder API is running!',
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    data: {
      users: 4,
      trainers: 2,
      specialties: 8,
    },
  });
});

// Mock trainers data
const mockTrainers = [
  {
    id: 1,
    name: 'Sarah Johnson',
    email: 'sarah@fitpro.com',
    bio: 'Certified personal trainer with 5+ years of experience helping clients achieve their fitness goals.',
    specialties: ['Weight Loss', 'Strength Training', 'Nutrition'],
    rating: 4.9,
    reviewCount: 127,
    location: {
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
    },
    hourlyRate: 85,
    profileImage:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
    isAvailable: true,
    experience: '5+ years',
    certifications: ['NASM-CPT', 'Precision Nutrition Level 1'],
  },
  {
    id: 2,
    name: 'Mike Rodriguez',
    email: 'mike@fitpro.com',
    bio: 'Former professional athlete turned trainer, specializing in sports performance and injury prevention.',
    specialties: [
      'Sports Performance',
      'Injury Prevention',
      'Functional Training',
    ],
    rating: 4.8,
    reviewCount: 89,
    location: {
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
    },
    hourlyRate: 95,
    profileImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
    isAvailable: true,
    experience: '8+ years',
    certifications: ['ACSM-CPT', 'FMS Level 2'],
  },
];

// Mock specialties data
const mockSpecialties = [
  { id: 1, name: 'Weight Loss' },
  { id: 2, name: 'Strength Training' },
  { id: 3, name: 'Cardio Fitness' },
  { id: 4, name: 'Yoga' },
  { id: 5, name: 'Pilates' },
  { id: 6, name: 'Nutrition' },
  { id: 7, name: 'Sports Performance' },
  { id: 8, name: 'Injury Prevention' },
];

// Trainers endpoint
app.get('/api/trainers', (req, res) => {
  const {
    search,
    specialty,
    city,
    state,
    minRating,
    page = 1,
    limit = 20,
  } = req.query;

  let filteredTrainers = [...mockTrainers];

  // Apply filters
  if (search) {
    const searchLower = search.toLowerCase();
    filteredTrainers = filteredTrainers.filter(
      trainer =>
        trainer.name.toLowerCase().includes(searchLower) ||
        trainer.bio.toLowerCase().includes(searchLower) ||
        trainer.specialties.some(s => s.toLowerCase().includes(searchLower))
    );
  }

  if (specialty && specialty !== 'All Specialties') {
    filteredTrainers = filteredTrainers.filter(trainer =>
      trainer.specialties.includes(specialty)
    );
  }

  if (city) {
    filteredTrainers = filteredTrainers.filter(trainer =>
      trainer.location.city.toLowerCase().includes(city.toLowerCase())
    );
  }

  if (state && state !== 'All States') {
    filteredTrainers = filteredTrainers.filter(
      trainer => trainer.location.state === state
    );
  }

  if (minRating) {
    const rating = parseFloat(minRating);
    filteredTrainers = filteredTrainers.filter(
      trainer => trainer.rating >= rating
    );
  }

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedTrainers = filteredTrainers.slice(startIndex, endIndex);

  res.json({
    success: true,
    data: paginatedTrainers,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredTrainers.length / limit),
      totalCount: filteredTrainers.length,
      hasNextPage: endIndex < filteredTrainers.length,
      hasPrevPage: startIndex > 0,
      limit: parseInt(limit),
    },
  });
});

// Specialties endpoint
app.get('/api/specialties', (req, res) => {
  res.json({
    success: true,
    data: mockSpecialties,
  });
});

// Individual trainer endpoint
app.get('/api/trainers/:id', (req, res) => {
  const trainerId = parseInt(req.params.id);
  const trainer = mockTrainers.find(t => t.id === trainerId);

  if (!trainer) {
    return res.status(404).json({
      success: false,
      message: 'Trainer not found',
    });
  }

  res.json({
    success: true,
    data: trainer,
  });
});

app.listen(PORT, () => {
  console.log(
    `🚀 FitProFinder Test Server running on http://localhost:${PORT}`
  );
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 API test: http://localhost:${PORT}/api/test`);
});
