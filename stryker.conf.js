module.exports = function(config) {
  config.set({
    mutate: ['src/**/*.ts', '!src/__mocks__/**/*.ts'],
    mutator: 'typescript',
    packageManager: 'yarn',
    testRunner: 'jest',
    reporters: ['html', 'clear-text', 'progress'],
    coverageAnalysis: 'off',
    tsconfigFile: 'tsconfig.json',
    timeoutMS: 1000,
    tempDirName: '.stryker',
  });
};
