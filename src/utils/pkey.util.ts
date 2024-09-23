import { ParamKey, PropKey } from '../types'

export const getPKey = (key: ParamKey | PropKey): string => {
    const parts = key.split(':')

    return parts[1] || ''
}
