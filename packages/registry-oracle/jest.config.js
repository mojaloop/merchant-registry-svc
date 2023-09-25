module.exports = {
  projects: [
    {
      displayName: 'Unit Tests',
      testMatch: ['<rootDir>/__tests__/unit/**/*.[jt]s'],
      preset: 'ts-jest',
      testEnvironment: 'node'
    },
    {
      displayName: 'Integration Tests',
      testMatch: ['<rootDir>/__tests__/integration/**/*.[jt]s'],
      preset: 'ts-jest',
      testEnvironment: 'node'
    }
  ]
}
