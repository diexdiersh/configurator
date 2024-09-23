import { ConfigLoader } from './config-loader.interface'
import { InjectionOptions } from './injection-options.interface'

export interface ConfiguratorModuleConfig {
    loader: ConfigLoader
    verbose?: boolean
    throwInEmptyConfig?: boolean
    injectionOptions?: InjectionOptions
}
