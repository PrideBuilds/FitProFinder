import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    message: 'FitProFinder API is running!',
  });
});

// Mock trainer data
const trainers = [
  {
    id: '1',
    name: 'John Smith',
    specialty: 'Personal Training',
    location: 'New York, NY',
    rating: 4.8,
    hourlyRate: 75,
    isVerified: true,
    isFeatured: true,
    bio: 'Certified personal trainer with 8+ years of experience helping clients achieve their fitness goals.',
    image: '/default-avatar.svg',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    specialty: 'Yoga',
    location: 'Los Angeles, CA',
    rating: 4.9,
    hourlyRate: 60,
    isVerified: true,
    isFeatured: false,
    bio: 'Experienced yoga instructor passionate about helping others find balance and wellness.',
    image: '/default-avatar.svg',
  },
  {
    id: '3',
    name: 'Mike Wilson',
    specialty: 'CrossFit',
    location: 'Chicago, IL',
    rating: 4.7,
    hourlyRate: 65,
    isVerified: true,
    isFeatured: false,
    bio: 'CrossFit Level 2 trainer specializing in high-intensity functional fitness.',
    image: '/default-avatar.svg',
  },
  {
    id: '4',
    name: 'Emily Davis',
    specialty: 'Nutrition Coaching',
    location: 'Miami, FL',
    rating: 4.9,
    hourlyRate: 55,
    isVerified: true,
    isFeatured: true,
    bio: 'Registered dietitian and nutrition coach helping clients achieve their health goals.',
    image: '/default-avatar.svg',
  },
];

// Get all trainers
app.get('/api/trainers', (req, res) => {
  const { location, specialty, rating, sessionType } = req.query;

  let filteredTrainers = [...trainers];

  // Filter by location
  if (location) {
    filteredTrainers = filteredTrainers.filter(trainer =>
      trainer.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  // Filter by specialty
  if (specialty && specialty !== 'All Specialties') {
    filteredTrainers = filteredTrainers.filter(trainer =>
      trainer.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  }

  // Filter by rating
  if (rating && rating !== 'Any Rating') {
    const minRating = parseFloat(rating);
    filteredTrainers = filteredTrainers.filter(
      trainer => trainer.rating >= minRating
    );
  }

  res.json({
    success: true,
    data: filteredTrainers,
    total: filteredTrainers.length,
  });
});

// Get trainer by ID
app.get('/api/trainers/:id', (req, res) => {
  const trainer = trainers.find(t => t.id === req.params.id);

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

// Get specialties
app.get('/api/specialties', (req, res) => {
  const specialties = [
    { id: 1, name: 'Personal Training', icon: 'dumbbell' },
    { id: 2, name: 'Yoga', icon: 'lotus' },
    { id: 3, name: 'CrossFit', icon: 'fire' },
    { id: 4, name: 'Nutrition Coaching', icon: 'apple' },
    { id: 5, name: 'Pilates', icon: 'balance' },
    { id: 6, name: 'Cardio Training', icon: 'heart' },
    { id: 7, name: 'Strength Training', icon: 'muscle' },
    { id: 8, name: 'Rehabilitation', icon: 'healing' },
  ];

  res.json({
    success: true,
    data: specialties,
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    data: {
      users: 4,
      trainers: trainers.length,
      specialties: 8,
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 FitProFinder API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`👨‍💼 Trainers API: http://localhost:${PORT}/api/trainers`);
  console.log(`🏋️  Specialties API: http://localhost:${PORT}/api/specialties`);
});
