/** @type {import('ts-jest').JestConfigWithTsJest} */
import { defaults as tsjPreset } from "ts-jest/presets";
export default {
  preset: "@shelf/jest-mongodb",
  testEnvironment: "node",
  transform: tsjPreset.transform,
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup-tests.ts"],
  modulePathIgnorePatterns: [
    "<rootDir>/__tests__/setup.ts",
    "<rootDir>/__tests__/setup-tests.ts",
    "<rootDir>/__tests__/teardown.ts",
    "<rootDir>/__tests__/universal.ts",
  ],
  globalSetup: "<rootDir>/__tests__/setup.ts",
  globalTeardown: "<rootDir>/__tests__/teardown.ts",
};
