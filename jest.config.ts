import { JestConfigWithTsJest, pathsToModuleNameMapper } from "ts-jest"

import { compilerOptions } from "./tsconfig.base.json"

const jestConfig: JestConfigWithTsJest = {
  preset: "ts-jest",
  verbose: true,
  moduleFileExtensions: ["js", "ts"],
  testEnvironment: "node",
  roots: ["src"],
  modulePaths: [compilerOptions.baseUrl],
  testRegex: ".test.ts$",
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
  transform: {
    "^.+\\.(t|j)s$": [
      "ts-jest",
      { tsconfig: "tsconfig.build.json", isolatedModules: true },
    ],
  },
  maxConcurrency: 10,
}

export default jestConfig
