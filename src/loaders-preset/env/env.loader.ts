import * as dotenv from "dotenv"

import { ConfigLoader } from "~interfaces"

import { LoaderConfig } from "../interfaces"

export const createEnvLoader = (config: LoaderConfig): ConfigLoader => {
  if (config.mode === "DirectoryTree") {
    throw new Error("Mode DirectoryTree not allowed for env loader!")
  }

  dotenv.config({ path: config.source })

  const load = (namespace: string[]) => {
    const fullEnv = namespace.join("_")

    return process.env[fullEnv]
  }

  return {
    load,
    loadAsync: async (nm) => {
      return load(nm)
    },
  }
}
