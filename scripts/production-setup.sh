#!/bin/bash
# FitProFinder Production Setup Script

echo "🚀 FitProFinder Production Setup"
echo "================================="

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }

echo "✅ Prerequisites check passed"

# Setup frontend for production
echo ""
echo "📦 Building frontend for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

# Setup backend for production
echo ""
echo "🔧 Setting up backend..."
cd backend

# Install production dependencies
npm ci --only=production

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit backend/.env with your production values:"
    echo "   - Database connection details"
    echo "   - JWT secret (generate a secure random string)"
    echo "   - Email service credentials"
    echo "   - Stripe keys"
    echo "   - Other service credentials"
    echo ""
    read -p "Press Enter when you've configured your .env file..."
fi

# Run database migrations
echo ""
echo "📊 Running database migrations..."
npm run migrate

if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed"
else
    echo "❌ Database migrations failed. Please check your database connection."
    exit 1
fi

# Seed initial data
echo ""
echo "🌱 Seeding initial data..."
npm run seed

cd ..

echo ""
echo "🎉 Production setup complete!"
echo ""
echo "Next steps:"
echo "1. Deploy frontend to Netlify/Vercel"
echo "2. Deploy backend to Railway/Render"
echo "3. Configure your domain name"
echo "4. Set up SSL certificates (automatic with most hosts)"
echo "5. Test all functionality in production"
echo ""
echo "📖 See deploy-guide.md for detailed deployment instructions" 