import { beforeAll, afterAll, afterEach } from 'vitest';

// Setup global test environment
beforeAll(() => {
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'mysql://test:test@localhost:3306/test';
});

afterEach(() => {
  // Clean up after each test if needed
});

afterAll(() => {
  // Clean up after all tests
});
