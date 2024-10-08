export const GLOBAL_CONFIG_NS = 'G_CONFIG_NS'
export const LOCAL_CONFIG_NS = 'L_CONFIG_NS'

export const CONFIG_SCHEMA = 'CONFIG_SCHEMA'

export const INJECT_CONFIG_WATERMARK = 'INJ_CONFIG_MARK'

export const METADATA_KEYS = [
    GLOBAL_CONFIG_NS,
    LOCAL_CONFIG_NS,
    CONFIG_SCHEMA,
    INJECT_CONFIG_WATERMARK,
] as const

export type METADATA_KEYS_TYPE = typeof METADATA_KEYS[number]
