# Contributing to projectnaricare

Thank you for your interest in contributing! This project welcomes contributions from the community.

## How to Contribute

### Fork the Repository

1. Click the "Fork" button on GitHub
2. Clone your forked repository:
```bash
git clone https://github.com/YOUR_USERNAME/projectnaricare.git
cd projectnaricare
```

### Set Up Development Environment

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Make Your Changes

```bash
# Create a new branch
git checkout -b feature/your-feature-name

# Make your changes
# ... edit files ...

# Run linter
npm run lint

# Run tests
npm run test:e2e

# Commit your changes
git add .
git commit -m "Add your feature description"
```

### Submit a Pull Request

1. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request on GitHub

3. Fill in the PR template with:
   - Description of your changes
   - Related issue number (if applicable)
   - Testing performed

## Coding Standards

- Follow the existing code style and conventions
- Use TypeScript for all new code
- Write meaningful component and variable names
- Keep components focused and modular
- Run `npm run lint` before committing

## Types of Contributions

- **Bug fixes**: Report issues on GitHub first
- **New features**: Open an issue to discuss before implementing
- **UI/UX improvements**: Visual and interaction enhancements always welcome
- **Documentation**: Improvements to README, guides, or inline docs
- **Tests**: Increase test coverage with Playwright
