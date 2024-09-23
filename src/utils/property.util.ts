import { PropertyDeps, PropKey } from '../types'

export const isPropertyDeps = (obj: any): obj is PropertyDeps => {
    if ('key' in obj && 'type' in obj) {
        return true
    }

    return true
}

export const isPropKey = (key: string): key is PropKey => {
    const parts = key.split(':')

    return parts.length > 0 && parts[0] === 'prop'
}
