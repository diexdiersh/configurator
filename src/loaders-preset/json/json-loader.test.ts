import fs, { rmSync } from 'fs'
import { resolve, join } from 'path'

import { createJsonLoader } from './json.loader'
import { glob } from 'glob'

const allPathes: string[] = []

const TEMP_JSON_PATH = (prefix: string) =>
    resolve(__dirname, `${prefix}-temp.test.json`)

const TEMP_DIR_PATH = (prefix: string) => resolve(__dirname, `${prefix}-temp`)

// Utility to create directories and files
const createTempDirStructure = (json: Record<string, any>, dirPath: string) => {
    fs.mkdirSync(dirPath, { recursive: true })
    const keys = Object.keys(json)
    keys.forEach((key) => {
        const value = json[key]
        if (typeof value === 'object') {
            createTempDirStructure(value, join(dirPath, key))
        } else {
            fs.writeFileSync(
                join(dirPath, key + '.json'),
                JSON.stringify({ value }),
                { encoding: 'utf8' },
            )
        }
    })
}

const deleteTempDirStructure = (path: string) => {
    fs.rmSync(path, { recursive: true, force: true })
}

const createTempJson = (json: string, path: string) => {
    fs.writeFileSync(path, json, { encoding: 'utf8' })
}

const deleteTempJson = (path: string) => {
    fs.rmSync(path)
}

const generateRandomString = (length: number) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * characters.length),
        )
    }
    return result
}

const generateRandomKeys = (numKeys: number, keyLength: number) => {
    const keys: string[] = []
    for (let i = 0; i < numKeys; i++) {
        keys.push(generateRandomString(keyLength))
    }
    return keys
}

const generateJson = () => {
    const numKeys = Math.floor(Math.random() * 6) + 1
    const keyLength = Math.floor(Math.random() * 5) + 3
    const keys = generateRandomKeys(numKeys, keyLength)

    const randomIndex = Math.floor(Math.random() * keys.length)
    const randomValue = Math.random().toString(36).substring(2, 15)

    let json = {}
    let temp: Record<string, any> = json

    for (let i = 0; i <= randomIndex; i++) {
        if (i === randomIndex) {
            temp[keys[i]] = randomValue
        } else {
            temp[keys[i]] = {}
            temp = temp[keys[i]]
        }
    }
    return { json, keyPath: keys.slice(0, randomIndex + 1), value: randomValue }
}

const singleFileRun = (data: {
    json: {}
    keyPath: string[]
    value: string
}) => {
    const { json, keyPath, value } = data

    console.log(`JSON: ${JSON.stringify(json)}`)

    const path = TEMP_JSON_PATH(value)

    allPathes.push(path)

    createTempJson(JSON.stringify(json), path)

    const jsonLoader = createJsonLoader({
        mode: 'SingleFile',
        source: path,
    })

    const loadedValue = jsonLoader.load(keyPath)

    console.log(`loadedValue: ${loadedValue}, value: ${value}`)

    expect(loadedValue).toBe(value)

    deleteTempJson(path)
}

const directoryTreeRun = (data: {
    json: {}
    keyPath: string[]
    value: string
}) => {
    const { json, keyPath, value } = data

    console.log(`JSON: ${JSON.stringify(json)}`)

    const path = TEMP_DIR_PATH(value)

    allPathes.push(path)

    createTempDirStructure(json, path)

    const jsonLoader = createJsonLoader({
        mode: 'DirectoryTree',
        source: path,
    })

    const loadedValue = jsonLoader.load(keyPath)

    console.log(`loadedValue: ${loadedValue}, value: ${value}`)

    expect(JSON.stringify(loadedValue)).toBe(JSON.stringify({ value }))

    deleteTempDirStructure(path)
}

const NUM_TESTS = 100
const testData = Array.from({ length: NUM_TESTS }, generateJson)

describe('createJsonLoader', () => {
    test.concurrent.each(testData)('SingleFile - %#', singleFileRun)

    test.concurrent.each(testData)('DirectoryTree - %#', directoryTreeRun)

    afterAll(() => {
        const tempPaths = glob.sync(
            [join(__dirname, '**', 'temp*'), join(__dirname, '*-temp')],
            {
                dot: true,
            },
        )

        tempPaths
            .filter((p) => allPathes.includes(p))
            .forEach((path) => {
                rmSync(path, { recursive: true, force: true })
            })
    })
})
