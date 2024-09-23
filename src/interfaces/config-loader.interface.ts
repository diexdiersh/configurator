export interface ConfigLoader<T = any> {
    load(namespace: string[]): T
    loadAsync(namespace: string[]): Promise<T>
}
