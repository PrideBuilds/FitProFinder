# Contributing to FitProFinder

Thank you for your interest in contributing to FitProFinder! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Commit Style](#commit-style)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to conduct@fitprofinder.com.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature or bugfix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js (LTS version - see `.nvmrc`)
- pnpm (recommended) or npm
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/fitprofinder.git
   cd fitprofinder
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp env/.env.example .env.local
   # Edit .env.local with your configuration
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Database Setup

1. Set up Supabase (or use local development database)
2. Run migrations:

   ```bash
   pnpm db:migrate
   ```

3. Seed the database:
   ```bash
   pnpm seed
   ```

## Making Changes

### Branch Naming

Use descriptive branch names:

- `feature/user-authentication`
- `bugfix/payment-processing`
- `docs/api-documentation`

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Use Prettier for formatting
- Use ESLint for linting
- Write meaningful commit messages

### File Structure

```
src/
├── components/     # Reusable UI components
├── layouts/        # Page layouts
├── pages/          # Astro pages
├── lib/            # Utility functions and configurations
├── types/          # TypeScript type definitions
└── styles/         # Global styles
```

## Testing

### Running Tests

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Type checking
pnpm typecheck
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for API endpoints
- Write E2E tests for critical user flows
- Aim for good test coverage

## Submitting Changes

### Before Submitting

1. Ensure all tests pass
2. Run linting and formatting:
   ```bash
   pnpm lint
   pnpm format
   ```
3. Update documentation if needed
4. Add or update tests if needed

### Commit Style

We use conventional commits. Format your commits as:

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:

```
feat(auth): add OAuth login support
fix(payments): resolve Stripe webhook validation
docs(api): update authentication endpoints
```

### Pull Request Process

1. Ensure your branch is up to date with main
2. Create a descriptive pull request title
3. Provide a detailed description of changes
4. Link any related issues
5. Request review from maintainers
6. Address feedback promptly

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

## Development Guidelines

### TypeScript

- Use strict TypeScript configuration
- Define proper types for all functions and variables
- Avoid `any` type unless absolutely necessary
- Use interfaces for object shapes

### Error Handling

- Use proper error boundaries
- Log errors appropriately
- Provide meaningful error messages to users
- Handle edge cases gracefully

### Performance

- Optimize images and assets
- Use lazy loading where appropriate
- Minimize bundle size
- Consider caching strategies

### Security

- Validate all inputs
- Sanitize user data
- Use secure authentication methods
- Follow security best practices

## Getting Help

- Check existing issues and discussions
- Join our Discord/Slack community
- Contact maintainers directly
- Read the documentation

## Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to FitProFinder! 🚀
