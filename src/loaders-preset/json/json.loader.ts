import fs from "fs"
import fsAsync from "fs/promises"
import { resolve } from "path"

import { ConfigLoader } from "~interfaces"

import { LoaderConfig } from "../interfaces"

const unknownModeError = new Error("Loader mode not resolved!")

export const createJsonLoader = (config: LoaderConfig): ConfigLoader => {
  let load = (namespace: string[]): unknown => {
    throw unknownModeError
  }
  let loadAsync = async (namespace: string[]): Promise<unknown> => {
    throw unknownModeError
  }

  switch (config.mode) {
    case "SingleFile":
      {
        const path = resolve(process.cwd(), config.source)

        const searchData = (namespace: string[], jsonData: string) => {
          const obj = JSON.parse(jsonData)

          let data = obj

          for (const nm of namespace) {
            const subObj = data[nm]

            if (!subObj) {
              return undefined
            }

            data = subObj
          }

          return data
        }
        load = (namespace) => {
          const jsonData = fs.readFileSync(path, { encoding: "utf8" })
          return searchData(namespace, jsonData)
        }
        loadAsync = async (namespace) => {
          const jsonData = await fsAsync.readFile(path, {
            encoding: "utf8",
          })

          return searchData(namespace, jsonData)
        }
      }
      break
    case "DirectoryTree":
      {
        const resolvePath = (namespace: string[]): string => {
          const normalizedNs = namespace.map((ns) => ns.toLowerCase())
          const file = normalizedNs.slice(-1) as [string]
          const dirs = normalizedNs
            .slice(0, normalizedNs.length - 1)
            .map((ns) => `${ns}/`)
          return resolve(config.source, ...dirs, `${file[0]}.json`)
        }

        load = (namespace) => {
          const path = resolvePath(namespace)
          const jsonData = fs.readFileSync(path, { encoding: "utf8" })
          return JSON.parse(jsonData)
        }
        loadAsync = async (namespace) => {
          const path = resolvePath(namespace)

          const jsonData = await fsAsync.readFile(path, {
            encoding: "utf8",
          })

          return JSON.parse(jsonData)
        }
      }
      break
  }

  return {
    load,
    loadAsync,
  }
}
