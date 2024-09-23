import { Inject } from '@nestjs/common'

import {
    EMPTY_CONFIG,
    INJECT_CONFIG_WATERMARK,
    INTERNAL_CONFIG_MARK,
    LOCAL_CONFIG_NS,
} from '../constants'
import { ConfigMetadata, ParamKey, PropKey } from '../types'
import { hashKey, isNil } from '../utils'

export function InjectConfig(
    namespaceKey?: string,
): PropertyDecorator & ParameterDecorator {
    return (
        target: object,
        key: string | symbol | undefined,
        index?: number,
    ) => {
        const injectEmpty = Inject(EMPTY_CONFIG)
        let metadataTarget: object = target
        const isProperty = key && isNil(index)
        /**
         * Properties
         */
        if (isProperty) {
            injectEmpty(target, key)
            metadataTarget = target.constructor
        }
        /**
         * Constructor parameters
         */
        if (!isNil(index)) {
            injectEmpty(target, key, index)
        }

        const isMarked =
            INTERNAL_CONFIG_MARK in target ||
            INTERNAL_CONFIG_MARK in target.constructor

        if (!isMarked) {
            Reflect.defineProperty(metadataTarget, INTERNAL_CONFIG_MARK, {
                value: false,
                writable: true,
            })
            const injectInternal = Inject(INTERNAL_CONFIG_MARK)

            injectInternal(target, INTERNAL_CONFIG_MARK)
        }

        let injectToken = namespaceKey

        const idKey: ParamKey | PropKey = isProperty
            ? `prop:${String(key)}`
            : `param:${index}`

        if (!injectToken) {
            const hash = hashKey(idKey)
            injectToken = `${EMPTY_CONFIG}[${hash}]`
        }

        Reflect.defineMetadata(INJECT_CONFIG_WATERMARK, true, metadataTarget)

        const namespaces: ConfigMetadata =
            Reflect.getOwnMetadata(LOCAL_CONFIG_NS, metadataTarget) || {}
        namespaces[idKey] = injectToken
        Reflect.defineMetadata(LOCAL_CONFIG_NS, namespaces, metadataTarget)
    }
}
