# Contributing to Matching App

Thank you for your interest in contributing to Matching App! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- The use of sexualized language or imagery
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- npm 6+
- Git

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/matching-app.git
   cd matching-app
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/s1f102300638/matching-app.git
   ```

4. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

5. **Set up environment variables**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your values
   
   # Frontend
   cd ../frontend
   cp .env.example .env.local
   # Edit .env.local if needed
   ```

6. **Initialize database**
   ```bash
   cd backend
   npm run init-db
   ```

7. **Start development servers**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## 🔄 Development Workflow

### Branch Naming

Use descriptive branch names with prefixes:
- `feature/` - New features (e.g., `feature/add-video-chat`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)
- `refactor/` - Code refactoring (e.g., `refactor/api-endpoints`)
- `test/` - Adding tests (e.g., `test/auth-flow`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

### Creating a Feature Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Test your changes thoroughly
3. Commit your changes (see [Commit Guidelines](#commit-guidelines))
4. Push to your fork
5. Create a Pull Request

## 💻 Coding Standards

### JavaScript/React

- Use **ES6+** syntax
- Use **functional components** with hooks
- Follow **Airbnb JavaScript Style Guide**
- Use **meaningful variable and function names**
- Add **JSDoc comments** for complex functions
- Keep functions **small and focused** (single responsibility)

**Example:**
```javascript
/**
 * Validates an email address
 * @param {string} email - The email address to validate
 * @returns {boolean} True if valid, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

### CSS

- Use **BEM methodology** for class naming
- Keep specificity low
- Use **CSS variables** for colors and spacing
- Mobile-first approach

### File Structure

```
src/
├── components/     # Reusable React components
├── contexts/       # React contexts
├── hooks/          # Custom hooks
├── utils/          # Utility functions
├── services/       # API services
└── config/         # Configuration files
```

### Code Quality

- **No console.logs** in production code (use proper logging)
- **No commented-out code** (use git history instead)
- **Handle all edge cases**
- **Add error handling** for async operations
- **Validate all user inputs**

## 📝 Commit Guidelines

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```bash
feat(auth): add password reset functionality

Implemented password reset via email with token-based verification.
Added new API endpoint and email template.

Closes #123

---

fix(swipe): prevent duplicate swipe on same user

Added check to prevent users from swiping on the same person twice.

---

docs(readme): update installation instructions

Added detailed steps for database initialization.
```

### Commit Best Practices

- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Limit the subject line to 50 characters
- Capitalize the subject line
- Do not end the subject line with a period
- Use the body to explain *what* and *why*, not *how*

## 🔀 Pull Request Process

### Before Submitting

1. **Update your branch**
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Test your changes**
   - Run all existing tests
   - Add new tests if applicable
   - Test manually in the browser

3. **Check code quality**
   - Run linter: `npm run lint`
   - Format code: `npm run format`
   - No console errors or warnings

4. **Update documentation**
   - Update README if needed
   - Add JSDoc comments
   - Update API documentation if API changes

### Creating a Pull Request

1. **Push to your fork**
   ```bash
   git push origin your-branch
   ```

2. **Open a Pull Request on GitHub**
   - Use a clear, descriptive title
   - Fill out the PR template completely
   - Link related issues (e.g., "Closes #123")
   - Add screenshots for UI changes
   - Request review from maintainers

### PR Title Format

```
[Type] Brief description (#issue-number)
```

**Examples:**
- `[Feature] Add video chat functionality (#45)`
- `[Fix] Resolve login redirect issue (#67)`
- `[Docs] Update API documentation (#89)`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Related Issues
Closes #(issue number)
```

### Review Process

1. Maintainers will review your PR
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your changes will be included in the next release

## 🐛 Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Check if the issue persists in the latest version
3. Collect detailed information about the bug

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Screenshots
If applicable, add screenshots

## Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 98, Safari 15]
- Version: [e.g., 1.0.0]

## Additional Context
Any other relevant information
```

## 💡 Suggesting Features

### Before Suggesting

1. Check if the feature has already been requested
2. Check if it aligns with the project goals
3. Consider if it benefits the majority of users

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature

## Problem It Solves
Explain the problem this feature would solve

## Proposed Solution
Describe your proposed solution

## Alternatives Considered
Alternative solutions you've considered

## Additional Context
Any other relevant information, mockups, or examples
```

## 🎯 Development Tips

### Debugging

- Use React Developer Tools
- Use Redux DevTools (if Redux is added)
- Check browser console for errors
- Use `console.log()` strategically (remove before committing)
- Use breakpoints in browser DevTools

### Testing

- Write unit tests for new functions
- Write integration tests for API endpoints
- Write E2E tests for critical user flows
- Aim for >80% code coverage

### Performance

- Optimize images before committing
- Use React.memo() for expensive components
- Implement lazy loading
- Minimize bundle size
- Use lighthouse for performance auditing

## 📞 Getting Help

- **Discord:** [Join our server](#)
- **Email:** dev@matching-app.com
- **GitHub Issues:** [Open an issue](https://github.com/s1f102300638/matching-app/issues)

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website (when available)

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to Matching App! 💖**
