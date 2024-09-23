import { ConfigurableModuleBuilder } from '@nestjs/common'

import { ConfiguratorModuleConfig } from '../interfaces'

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
    new ConfigurableModuleBuilder<ConfiguratorModuleConfig>({})
        .setClassMethodName('forRoot')
        .build()
