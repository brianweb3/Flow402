# Contributing to Flow402

Thank you for your interest in contributing to Flow402! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Flow402.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes: `git commit -m "Add feature: description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## Development Setup

See the [README.md](./README.md) for detailed setup instructions.

## Contribution Guidelines

### Code Style

- Follow TypeScript best practices
- Use ESLint and Prettier configurations provided
- Write self-documenting code with clear variable names
- Add JSDoc comments for public APIs

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add payment verification endpoint
fix: Resolve authentication token expiration issue
docs: Update API documentation
refactor: Simplify payment calculation logic
test: Add unit tests for calculator functions
```

### Pull Request Process

1. Ensure all tests pass: `npm test`
2. Run linter: `npm run lint`
3. Update documentation if needed
4. Add tests for new features
5. Ensure code follows project style guidelines
6. Request review from maintainers

### Testing Requirements

- All new features must include tests
- Maintain or improve test coverage
- Tests should be clear and well-documented

### Documentation

- Update README.md for user-facing changes
- Update API documentation for endpoint changes
- Add inline comments for complex logic

## Project Structure

- `/app` - Next.js application code
- `/components` - React components
- `/lib` - Core libraries and utilities
- `/rust-lib` - Rust cryptographic library
- `/prisma` - Database schema and migrations
- `/__tests__` - Test files

## Areas for Contribution

- Bug fixes
- New features
- Documentation improvements
- Performance optimizations
- Test coverage
- Security enhancements

## Questions?

Open an issue or start a discussion on GitHub.

Thank you for contributing to Flow402!

