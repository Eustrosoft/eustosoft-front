/* eslint-disable */
export default {
  displayName: 'dao-ts',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/libs/dao-ts',
  setupFiles: ['<rootDir>/src/test/utils/setup.jest.ts'],
};
