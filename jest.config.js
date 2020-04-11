module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**.test.ts'],
    coverageDirectory: 'out/.coverage',
    modulePathIgnorePatterns: ['node_modules'],
    setupFilesAfterEnv: ['<rootDir>/test/matchers/Comparator.matcher.ts'],
}
