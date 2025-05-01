/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  rootDir: "./",
  testEnvironment: "node",
  preset: "ts-jest",
  testMatch: ["**/*.test.ts"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  coveragePathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/",
    "<rootDir>/src/server.ts",
  ]
};