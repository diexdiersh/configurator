export const isNil = (obj: any): obj is undefined | null => {
    return typeof obj === 'undefined' || obj === null
}
