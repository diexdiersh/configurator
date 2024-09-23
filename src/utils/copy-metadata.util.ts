export const copyMetadata = (source: Function, target: Function) => {
    const keys = Reflect.getMetadataKeys(source)
    for (const key of keys) {
        const metadataValue = Reflect.getMetadata(key, source)
        Reflect.defineMetadata(key, metadataValue, target)
    }
}
