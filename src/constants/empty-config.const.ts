import { FactoryProvider, Logger } from '@nestjs/common'

import { ConfigContainer } from '../classes'
import { ConfigLoader, ConfiguratorModuleConfig } from '../interfaces'
import { EMPTY_CONFIG, INTERNAL_CONFIG_MARK } from './inject-tokens.const'
import { MODULE_OPTIONS_TOKEN } from './module-definition.const'

const EMPTY_ERROR = new Error(
    `This config loader is empty! Check your loader and namespaces.`,
)

const EMPTY_CONFIG_CONTAINER = (
    isThrow: boolean,
    logger: Logger,
): ConfigContainer<{}> => {
    const emptyLoader: ConfigLoader = {
        load(_) {
            logger.warn(`Load in empty config container!`)

            if (isThrow) {
                throw EMPTY_ERROR
            }

            return {}
        },
        async loadAsync(_) {
            logger.warn(`Async load in empty config container!`)

            if (isThrow) {
                throw EMPTY_ERROR
            }
            return {}
        },
    }

    return new ConfigContainer([], emptyLoader)
}

export const EMPTY_CONFIG_PROVIDER: FactoryProvider<ConfigContainer> = {
    provide: EMPTY_CONFIG,
    inject: [
        { token: INTERNAL_CONFIG_MARK, optional: false },
        { token: MODULE_OPTIONS_TOKEN, optional: false },
    ],
    useFactory: (
        configInjected: boolean,
        moduleConfig: ConfiguratorModuleConfig,
    ): ConfigContainer => {
        if (!configInjected) {
            throw new Error('Looks like config injector not works!')
        }

        const logger = new Logger(EMPTY_CONFIG)

        const isEmptyThrow = !!moduleConfig.throwInEmptyConfig

        if (isEmptyThrow) {
            logger.warn('Load empty config will throw error.')
        }

        return EMPTY_CONFIG_CONTAINER(isEmptyThrow, logger)
    },
}
