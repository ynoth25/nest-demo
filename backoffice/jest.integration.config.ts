// jest.integration.config.ts
import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.integration-spec\\.ts$',  // Integration test files follow *.integration-spec.ts pattern
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage/integration',
  testEnvironment: 'node',
  reporters: [
    'default',
    [
      'jest-allure',
      {
        resultsDir: 'allure-results/jest/integration',
      },
    ],
  ],
  setupFilesAfterEnv: ['./jest.setup.ts'],  // Setup Allure for Jest
};

export default config;