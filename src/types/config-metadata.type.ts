export type ParamKey = `param:${string}`

export type PropKey = `prop:${string}`

export type ConfigMetadata = Record<ParamKey | PropKey, string>
