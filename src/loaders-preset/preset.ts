import { LoaderConfig } from "./interfaces"
import { createEnvLoader } from "./env"
import { createJsonLoader } from "./json"

export const loaderPreset = (
  preset: "ENV" | "JSON" | "YAML",
  config: LoaderConfig
) => {
  switch (preset) {
    case "ENV":
      return createEnvLoader(config)
      break
    case "JSON":
      return createJsonLoader(config)
      break
    // TODO - implements yaml loader
    case "YAML":
      throw new Error(`YAML loader not implemented!`)
      break
  }
}
