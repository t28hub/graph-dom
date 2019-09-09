module.exports = {
  rootDir: './',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsConfig: 'tsconfig.json',
    },
  },
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: 'reports/coverage',
  coverageReporters: ['lcov', 'text'],
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  reporters: ['default', ['jest-junit', { outputDirectory: 'reports/test', outputName: 'jest.xml' }]],
  verbose: true,
};
