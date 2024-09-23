import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper'

import { Namespace } from './namespace.type'

export type NamespaceContainer = {
    namespace: Namespace
    wrapper: InstanceWrapper
}
