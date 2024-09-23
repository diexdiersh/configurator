export const hashKey = (key: string) => {
    let h = 0
    for (let i = 0; i < key.length; i++) {
        h = (Math.imul(31, h) + key.charCodeAt(i)) | 0
    }
    return h.toString()
}
