import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',  // Unit test files follow *.spec.ts pattern
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage/unit',
  testEnvironment: "allure-jest/node",
  // testEnvironment: 'node',
  // reporters: [
  //   'default',
  //   [
  //     'jest-allure',
  //     {
  //       resultsDir: 'allure-results/jest/unit',
  //     },
  //   ],
  // ],
  // setupFilesAfterEnv: ['./jest.setup.ts'],  // Ensure this points to the correct setup file
};

export default config;
