# FitProFinder - Beta Release

A modern platform connecting fitness trainers with clients, built with Astro, TypeScript, and modern web technologies.

## 🚀 Getting Started (Beta)

### Prerequisites

- Node.js (LTS version - see `.nvmrc`)
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/fitprofinder.git
   cd fitprofinder
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server:**
   ```bash
   pnpm dev
   ```

### Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# CometChat Configuration
NEXT_PUBLIC_COMETCHAT_APP_ID=your_cometchat_app_id
NEXT_PUBLIC_COMETCHAT_REGION=your_cometchat_region
NEXT_PUBLIC_COMETCHAT_AUTH_KEY=your_cometchat_auth_key

# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# Feature Flags
ENABLE_BETA_GATE=true
INVITE_CODE_REQUIRED=true
```

## 🧪 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm format           # Format code with Prettier
pnpm format:check     # Check code formatting
pnpm typecheck        # Run TypeScript type checking

# Testing
pnpm test             # Run unit tests
pnpm test:watch       # Run tests in watch mode
pnpm test:e2e         # Run E2E tests
pnpm test:e2e:open    # Open Cypress test runner

# Database
pnpm seed             # Seed database with sample data

# Docker
pnpm start:docker     # Start with Docker Compose
```

### Database Setup

1. **Set up Supabase:**
   - Create a new Supabase project
   - Run the database migrations
   - Set up Row Level Security (RLS) policies

2. **Seed the database:**
   ```bash
   pnpm seed
   ```

### Testing

#### Unit Tests

```bash
pnpm test
```

#### E2E Tests

```bash
# Run headless
pnpm test:e2e

# Open test runner
pnpm test:e2e:open
```

## 🔒 Security Features

- **Content Security Policy (CSP)** headers
- **Rate limiting** on API endpoints
- **Input validation** with Zod
- **Authentication** and authorization
- **HTTPS enforcement** in production
- **Security headers** (HSTS, X-Frame-Options, etc.)

## 🎛️ Feature Flags

Control feature availability with feature flags:

```typescript
import { getFeatureFlag } from './src/lib/flags';

// Check if beta gate is enabled
const isBetaEnabled = await getFeatureFlag('beta_gate');

// Check if messaging is enabled
const isMessagingEnabled = await getFeatureFlag('messaging_enabled');
```

Available flags:

- `beta_gate`: Enable/disable beta access control
- `messaging_enabled`: Enable/disable messaging features
- `payments_enabled`: Enable/disable payment processing
- `reviews_enabled`: Enable/disable review system
- `analytics_enabled`: Enable/disable analytics tracking
- `maintenance_mode`: Enable/disable maintenance mode

## 🎫 Beta Access Control

### Invite Code System

1. **Generate invite codes:**

   ```typescript
   import { createBetaInvite } from './src/lib/beta';

   const invite = await createBetaInvite(
     'user@example.com',
     'admin',
     30 // expires in 30 days
   );
   ```

2. **Validate invite codes:**

   ```typescript
   import { validateInviteCode } from './src/lib/beta';

   const validation = await validateInviteCode('BETA2024');
   if (validation.valid) {
     // Allow access
   }
   ```

### Toggle Beta Gate

```bash
# Enable beta gate
ENABLE_BETA_GATE=true

# Disable beta gate
ENABLE_BETA_GATE=false
```

## 📊 Observability

### Analytics (PostHog)

Track user events and behavior:

```typescript
import { trackEvent } from './src/lib/analytics';

// Track user actions
trackEvent('trainer_profile_view', {
  trainerId: '123',
  trainerName: 'Sarah Johnson',
});

trackEvent('booking_confirmed', {
  bookingId: '456',
  amount: 85,
  currency: 'USD',
});
```

### Error Tracking

Automatic error tracking is enabled by default. Errors are logged to:

- Browser console (development)
- PostHog (production)
- Server logs (all environments)

## 🐳 Docker

### Local Development

```bash
# Start all services
pnpm start:docker

# Or use Docker Compose directly
docker compose up --build
```

### Production

```bash
# Build production image
docker build -t fitprofinder .

# Run production container
docker run -p 3000:3000 --env-file .env.local fitprofinder
```

## 🚀 Deployment

### Environment Variables

Set the following environment variables in your deployment platform:

**Required:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `JWT_SECRET`

**Optional:**

- `NEXT_PUBLIC_POSTHOG_KEY`
- `RESEND_API_KEY`
- `ENABLE_BETA_GATE`
- `INVITE_CODE_REQUIRED`

### Deployment Platforms

#### Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway deploy
```

## 🧪 Testing

### Test Data

The seed script creates:

- 5 sample trainers with profiles
- 16 specialties
- 3 sample clients
- 2 sample bookings
- 3 invite codes

### Test Cards (Stripe)

Use these test card numbers:

- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`

## 🐛 Known Issues

- Some edge cases in booking validation
- Mobile app not yet available
- Limited payment methods (credit cards only)
- No offline functionality
- Some accessibility improvements needed

## 📝 Reporting Issues

### Bug Reports

Use the in-app feedback button (floating blue button) or:

1. **GitHub Issues:** [Report bugs](https://github.com/fitprofinder/fitprofinder/issues)
2. **Email:** bugs@fitprofinder.com
3. **Discord:** [Join our community](https://discord.gg/fitprofinder)

### Feature Requests

1. **GitHub Discussions:** [Request features](https://github.com/fitprofinder/fitprofinder/discussions)
2. **Email:** features@fitprofinder.com

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

## 🔗 Links

- **Website:** https://fitprofinder.com
- **Documentation:** https://docs.fitprofinder.com
- **Discord:** https://discord.gg/fitprofinder
- **Twitter:** https://twitter.com/fitprofinder

---

**Beta Version 0.1.0** - Built with ❤️ by the FitProFinder team
