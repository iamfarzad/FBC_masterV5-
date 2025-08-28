# Testing Infrastructure

This directory contains a comprehensive testing infrastructure for the F.B/c AI application, including unit tests, integration tests, and end-to-end tests.

## 🏗️ Test Structure

```
tests/
├── unit/              # Unit tests for individual components and functions
├── integration/       # Integration tests for component interactions
├── e2e/               # End-to-end tests for complete user journeys
├── __mocks__/         # Mock implementations for external dependencies
├── utils/             # Shared test utilities and helpers
├── test-config.ts     # Central test configuration
├── run-tests.js       # Test runner script
└── README.md          # This file
```

## 🧪 Test Categories

### Unit Tests (`tests/unit/`)
- Test individual components in isolation
- Mock all external dependencies
- Focus on component logic and behavior
- Fast execution, high coverage

### Integration Tests (`tests/integration/`)
- Test component interactions
- Test data flow between components
- Mock external services but test real component integration
- Medium execution speed

### E2E Tests (`tests/e2e/`)
- Test complete user journeys
- Test real browser behavior
- No mocking - test the full application
- Slow execution, comprehensive coverage

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
pnpm test:all

# Run specific test types
pnpm test:unit          # Unit tests only
pnpm test:integration   # Integration tests only
pnpm test:e2e           # E2E tests only

# Run with coverage
pnpm test:unit:coverage

# Run in watch mode
pnpm test:unit:watch
```

### Advanced Test Runner

Use the custom test runner for more control:

```bash
# Run all test suites
node tests/run-tests.js all

# Run specific test types
node tests/run-tests.js unit --coverage
node tests/run-tests.js integration --watch
node tests/run-tests.js e2e --headed --browser=chrome

# Generate test reports
node tests/run-tests.js report
```

## 🛠️ Test Configuration

### Jest Configuration
- **Environment**: jsdom for browser-like testing
- **Setup**: Automatic test utilities and mocks
- **Coverage**: 70% threshold for branches, functions, lines, and statements
- **Path Mapping**: Automatic resolution for `@/` imports

### Playwright Configuration
- **Browsers**: Chromium, Firefox, WebKit
- **Parallel**: Fully parallel test execution
- **Tracing**: Automatic trace collection on failures
- **Screenshots**: Failure screenshots and videos

## 📝 Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Test Example

```typescript
import { render, screen } from '@testing-library/react'
import { ChatInterface } from '@/components/chat/ChatInterface'

describe('Chat Flow', () => {
  it('handles complete message flow', async () => {
    render(<ChatInterface />)

    // Send message
    await userEvent.type(screen.getByRole('textbox'), 'Hello')
    await userEvent.click(screen.getByRole('button', { name: /send/i }))

    // Verify message appears
    expect(screen.getByText('Hello')).toBeInTheDocument()

    // Wait for AI response
    await waitFor(() => {
      expect(screen.getByRole('article')).toBeInTheDocument()
    })
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('complete chat journey', async ({ page }) => {
  await page.goto('/chat')

  // Send message
  await page.fill('input[placeholder*="message"]', 'Hello')
  await page.click('button:has-text("Send")')

  // Wait for response
  await page.waitForSelector('[data-role="assistant"]')

  // Verify conversation
  await expect(page.locator('text=Hello')).toBeVisible()
  await expect(page.locator('[data-role="assistant"]')).toBeVisible()
})
```

## 🧰 Test Utilities

### Custom Render Function

```typescript
import { render } from '@/tests/utils/test-utils'

// Automatically includes providers and mocks
render(<MyComponent />)
```

### Mock Data Generators

```typescript
import { createMockMessage, createMockUser } from '@/tests/utils/test-utils'

const mockMessage = createMockMessage({ content: 'Test message' })
const mockUser = createMockUser({ name: 'Test User' })
```

### Accessibility Testing

```typescript
import { checkAccessibility } from '@/tests/utils/test-utils'

it('is accessible', () => {
  const { container } = render(<MyComponent />)
  checkAccessibility(container)
})
```

## 🎯 Test Best Practices

### 1. Test Organization
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Mocking Strategy
- Mock external dependencies (API calls, databases)
- Use real components for integration tests
- Avoid mocking for E2E tests

### 3. Test Data
- Use consistent mock data across tests
- Create test data factories for complex objects
- Avoid hard-coded test data

### 4. Accessibility
- Test keyboard navigation
- Check ARIA attributes
- Verify screen reader compatibility

### 5. Performance
- Use `measureRenderTime` for performance tests
- Monitor bundle size impact
- Test with realistic data volumes

## 📊 Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **E2E Tests**: Critical user journeys only
- **Overall**: 75%+ combined coverage

## 🔧 CI/CD Integration

Tests are configured for CI/CD environments:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    pnpm test:unit:coverage
    pnpm test:integration
    pnpm test:e2e
```

## 🐛 Debugging Tests

### Unit/Integration Tests
```bash
# Run specific test file
pnpm test -- tests/unit/components/button.test.tsx

# Run tests matching pattern
pnpm test -- --testNamePattern="renders with"

# Debug with breakpoints
node --inspect-brk ./node_modules/.bin/jest --runInBand
```

### E2E Tests
```bash
# Run in debug mode
node tests/run-tests.js e2e --debug

# Run with browser UI
node tests/run-tests.js e2e --headed

# Generate trace on failure
npx playwright show-trace test-results/
```

## 📈 Test Reports

### Coverage Reports
- **HTML**: `coverage/lcov-report/index.html`
- **JSON**: `coverage/coverage-final.json`
- **Text**: Console output with detailed breakdown

### E2E Reports
- **HTML**: `playwright-report/index.html`
- **Traces**: `test-results/` directory
- **Screenshots**: `test-results/screenshots/`

## 🔄 Test Maintenance

### Regular Tasks
- Update tests when components change
- Review and update mock data
- Update test configurations as needed
- Monitor test execution times

### Performance Monitoring
- Track test execution times
- Monitor coverage trends
- Identify flaky tests
- Optimize slow tests

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contributing

When adding new features:

1. Write unit tests for new components
2. Add integration tests for component interactions
3. Write E2E tests for critical user journeys
4. Update test documentation
5. Ensure all tests pass in CI/CD

---

For questions or issues with the testing infrastructure, please refer to the main project documentation or create an issue in the repository.
