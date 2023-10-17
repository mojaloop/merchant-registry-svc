module.exports = {
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/__tests__/unit/**/*.[jt]s'],
      preset: 'ts-jest',
      testEnvironment: 'node'
    },
    {
      displayName: 'E2E Tests',
      testMatch: ['<rootDir>/__tests__/e2e/e2e.tests.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node'
    }
  ]
}
