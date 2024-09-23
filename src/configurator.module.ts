import { DynamicModule, Logger, Type } from "@nestjs/common"
import { DiscoveryModule } from "@nestjs/core"

import {
  ConfigurableModuleClass,
  EMPTY_CONFIG,
  EMPTY_CONFIG_PROVIDER,
  INTERNAL_CONFIG_MARK,
  MODULE_OPTIONS_TOKEN,
} from "./constants"
import { ConfiguratorModuleConfig } from "./interfaces"
import { ConfigInjectorService } from "./services"

const LOGGER_TOKEN = "LOCAL_LOGGER"

const createConfiguratorModule = (
  module: Type,
  definition: DynamicModule
): DynamicModule => {
  return {
    module,
    imports: [...(definition.imports || []), DiscoveryModule],
    providers: [
      ...(definition.providers || []),
      { provide: LOGGER_TOKEN, useValue: new Logger(module.name) },
      ConfigInjectorService,
      {
        provide: INTERNAL_CONFIG_MARK,
        inject: [
          ConfigInjectorService,
          { token: MODULE_OPTIONS_TOKEN, optional: false },
          { token: LOGGER_TOKEN, optional: false },
        ],
        useFactory: (
          injectService: ConfigInjectorService,
          moduleConfig: ConfiguratorModuleConfig,
          logger: Logger
        ) => {
          const { loader } = moduleConfig

          if (moduleConfig.verbose) {
            logger.verbose(`Start inject config...`)
          }

          injectService.injectConfig(loader, moduleConfig)

          if (moduleConfig.verbose) {
            logger.verbose(`Start inject config...`)
          }

          return true
        },
      },
      EMPTY_CONFIG_PROVIDER,
    ],
    exports: [
      { provide: EMPTY_CONFIG, useExisting: EMPTY_CONFIG },
      {
        provide: INTERNAL_CONFIG_MARK,
        useExisting: INTERNAL_CONFIG_MARK,
      },
    ],
    global: true,
  }
}

export class ConfiguratorModule extends ConfigurableModuleClass {
  static forRoot(options: ConfiguratorModuleConfig): DynamicModule {
    const definition = super.forRoot(options)

    return createConfiguratorModule(ConfiguratorModule, definition)
  }
}
