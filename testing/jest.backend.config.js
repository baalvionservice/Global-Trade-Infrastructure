
/**
 * @file jest.backend.config.js
 * @description Authoritative configuration for mission-critical backend validation.
 */

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
  testMatch: [
    '**/testing/backend/**/*.test.ts'
  ],
  setupFilesAfterEnv: ['<rootDir>/setup-backend.ts'],
  verbose: true,
  collectCoverage: true,
  coverageDirectory: 'coverage/backend',
  coverageThreshold: {
    global: {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
};
