module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'server.js',
    'cardMapper.js',
    'llmService.js',
    '!node_modules/',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'prisma',
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js',
  ],
  verbose: true,
};
