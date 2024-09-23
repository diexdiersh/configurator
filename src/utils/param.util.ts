import { ParamKey, SelfParam } from '../types'

export const isSelfParam = (obj: any): obj is SelfParam => {
    if ('param' in obj && 'index' in obj) {
        return true
    }

    return false
}

export const isParamKey = (key: string): key is ParamKey => {
    const parts = key.split(':')

    return parts.length > 0 && parts[0] === 'param'
}
