import type { Config } from 'jest';

const config: Config = {
    rootDir: './../../../..',
    displayName: 'tableManipulator',
    preset: 'ts-jest',
    testMatch: ['<rootDir>/src/assets/lambdas/tableManipulator/test/**/*.test.ts'],
}

export default config;