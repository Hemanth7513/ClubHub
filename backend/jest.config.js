module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: ['routes/**/*.js', 'utils/**/*.js', 'middleware/**/*.js'],
  coverageDirectory: 'coverage',
  verbose: true,
};
