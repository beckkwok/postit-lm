# Server Unit Tests Documentation

## Overview
This document describes the unit test suite for `server.js` in the Node Card Server project.

## Test File
- **Location**: `server.test.js`
- **Test Framework**: Jest
- **HTTP Testing**: Supertest
- **Mocking**: Jest mocks for Prisma Client and LLM Service

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage Report
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers all endpoints and features in `server.js`:

### 1. Basic Routes
- **GET /**: Health check endpoint
  - ✓ Returns correct greeting message

### 2. Message Endpoints
- **GET /messages**: Retrieve all messages
  - ✓ Returns all messages ordered by creation time
  - ✓ Handles empty message list
  
- **POST /messages**: Create message and generate response
  - ✓ Creates user message and generates assistant response
  - ✓ Creates assistant message without LLM call
  - ✓ Passes previous messages as context to LLM
  - ✓ Excludes current message from context

### 3. Card Endpoints
- **GET /cards**: Retrieve all cards
  - ✓ Returns all cards with message associations
  - ✓ Correctly maps Prisma format to frontend format
  - ✓ Handles empty card list
  
- **POST /cards**: Create new card
  - ✓ Creates card with proper data transformation
  - ✓ Supports optional message association
  - ✓ Properly converts string IDs to integers
  
- **PUT /cards/:id**: Update entire card
  - ✓ Updates all card properties
  - ✓ Correctly transforms position and size data
  
- **PATCH /cards/:id/move**: Update card position
  - ✓ Updates card position coordinates
  - ✓ Validates position data structure
  - ✓ Rejects invalid/missing x coordinate
  - ✓ Rejects invalid/missing y coordinate
  - ✓ Rejects null position object
  
- **PATCH /cards/:id/resize**: Update card dimensions
  - ✓ Updates card width and height
  - ✓ Validates size data structure
  - ✓ Rejects invalid/missing width
  - ✓ Rejects invalid/missing height
  - ✓ Rejects null size object
  
- **PATCH /cards/:id/content**: Update card content
  - ✓ Updates card content text
  - ✓ Validates content is string type
  - ✓ Rejects non-string content
  - ✓ Allows empty string content
  
- **PATCH /cards/:id/title**: Update card title
  - ✓ Updates card title text
  - ✓ Validates title is string type
  - ✓ Rejects non-string titles
  - ✓ Allows empty string titles
  
- **DELETE /cards/:id**: Delete card
  - ✓ Deletes card and returns 204
  - ✓ Handles correct card ID conversion

### 4. Error Handling
- ✓ Handles database errors in GET /messages
- ✓ Handles database errors in POST /cards
- ✓ Handles database errors in DELETE /cards/:id

### 5. Data Mapping
- ✓ Correctly maps Prisma card format to frontend format
- ✓ Handles null messageId in mapping
- ✓ Converts string IDs to numbers
- ✓ Converts frontend card format to Prisma format

## Test Structure

Each test suite is organized by endpoint:

```javascript
describe('GET /endpoint', () => {
  it('should describe what it tests', async () => {
    // Arrange: Set up mocks and test data
    // Act: Make the request
    // Assert: Verify the response
  });
});
```

## Mocking Strategy

### Prisma Client
The test suite mocks the entire Prisma Client to avoid database dependencies:

```javascript
jest.mock('@prisma/client');
const prisma = {
  message: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  card: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
```

### LLM Service
The LLM Service is mocked to control AI responses:

```javascript
jest.mock('./llmService');
llmService.generateResponse.mockResolvedValue('Test response');
```

### dotenv
Configuration loading is mocked:

```javascript
jest.mock('dotenv');
```

## Key Testing Patterns

### 1. Request/Response Testing
```javascript
const response = await request(app)
  .post('/cards')
  .send({ title: 'Test', content: 'Content' });

expect(response.status).toBe(200);
expect(response.body).toHaveProperty('id');
```

### 2. Database Interaction Verification
```javascript
expect(prisma.card.create).toHaveBeenCalledWith({
  data: expect.objectContaining({ title: 'Test' })
});
```

### 3. Error Validation
```javascript
const response = await request(app)
  .patch('/cards/1/move')
  .send({ position: { x: 'invalid' } });

expect(response.status).toBe(400);
expect(response.body).toEqual({ error: 'Invalid position data' });
```

## Data Transformation Tests

The test suite verifies the cardMapper utility functions:

- `toCard()`: Converts Prisma format to frontend format
  - Converts numeric IDs to strings
  - Converts `posX/posY` to `position: {x, y}`
  - Converts `width/height` to `size: {width, height}`
  - Handles null messageId
  
- `toPrismaCard()`: Converts frontend format to Prisma format
  - Converts `position: {x, y}` to `posX/posY`
  - Converts `size: {width, height}` to `width/height`
  - Includes messageId association

## Example Test Cases

### Simple Validation
```javascript
it('should return 400 for invalid position data', async () => {
  const response = await request(app)
    .patch('/cards/1/move')
    .send({ position: { x: 'invalid', y: 100 } });

  expect(response.status).toBe(400);
  expect(response.body).toEqual({ error: 'Invalid position data' });
});
```

### Database Integration
```javascript
it('should create a user message and generate assistant response', async () => {
  const userMessage = { id: 1, role: 'user', content: 'Hello' };
  const assistantMessage = { id: 2, role: 'assistant', content: 'Hi!' };

  prisma.message.create.mockResolvedValueOnce(userMessage);
  prisma.message.findMany.mockResolvedValueOnce([]);
  llmService.generateResponse.mockResolvedValueOnce('Hi!');
  prisma.message.create.mockResolvedValueOnce(assistantMessage);

  const response = await request(app)
    .post('/messages')
    .send({ role: 'user', content: 'Hello' });

  expect(response.status).toBe(200);
  expect(response.body).toEqual([assistantMessage]);
});
```

## Coverage Goals

The test suite aims for:
- **Line Coverage**: 85%+
- **Branch Coverage**: 80%+
- **Function Coverage**: 90%+
- **Statement Coverage**: 85%+

Run coverage report with:
```bash
npm run test:coverage
```

## Best Practices

1. **Isolation**: Each test is independent and doesn't affect others
2. **Mocking**: All external dependencies (Prisma, LLM) are mocked
3. **Clarity**: Test names clearly describe what is being tested
4. **Coverage**: Both happy paths and error cases are tested
5. **Assertions**: Multiple assertions verify complete behavior

## Continuous Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

## Future Improvements

1. Add integration tests with real database
2. Add load/performance testing
3. Add end-to-end tests with real frontend
4. Add mutation testing
5. Add property-based testing for edge cases

## Troubleshooting

### Tests Failing
1. Ensure all dependencies are installed: `npm install`
2. Clear Jest cache: `npx jest --clearCache`
3. Check that mocks are properly configured
4. Verify Node version is 14+

### Coverage Issues
1. Check that all files are included in jest.config.js
2. Run `npm run test:coverage` to see detailed report
3. Look for untested branches in coverage report

### Mock Issues
1. Verify mocks are defined before creating app
2. Clear mocks between tests: `jest.clearAllMocks()`
3. Check mock implementation matches actual behavior

## Contributing

When adding new endpoints to server.js:
1. Add corresponding test cases
2. Test both happy path and error cases
3. Verify mocks are properly configured
4. Ensure coverage doesn't decrease
5. Update this documentation

