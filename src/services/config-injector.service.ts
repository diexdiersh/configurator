import { FactoryProvider, Injectable, Logger, Type } from '@nestjs/common'
import {
    PROPERTY_DEPS_METADATA,
    SELF_DECLARED_DEPS_METADATA,
} from '@nestjs/common/constants'
import { DiscoveryService, ModulesContainer } from '@nestjs/core'

import { ConfigContainer } from '../classes'
import {
    EMPTY_CONFIG,
    GLOBAL_CONFIG_NS,
    LOCAL_CONFIG_NS,
    METADATA_KEYS_TYPE,
} from '../constants'
import { ConfigLoader, ConfiguratorModuleConfig } from '../interfaces'
import { ConfigMetadata, PropertyDeps, SelfParam, WrapperLike } from '../types'
import { copyMetadata, getPKey, isParamKey, isPropKey } from '../utils'

@Injectable()
export class ConfigInjectorService {
    private readonly _logger = new Logger(ConfigInjectorService.name)

    private static _lock = false

    private _isVerbose = false

    constructor(
        private readonly _discoveryService: DiscoveryService,
        private readonly _modulesContainer: ModulesContainer,
    ) {}

    injectConfig(
        loader: ConfigLoader,
        modulOptions?: ConfiguratorModuleConfig,
    ) {
        if (ConfigInjectorService._lock) {
            this._logger.warn(
                `Method injectConfig of ${ConfigInjectorService.name} can be called once!`,
            )
            return
        }

        ConfigInjectorService._lock = true

        this._isVerbose = !!modulOptions?.verbose
        const showGraph = !!modulOptions?.injectionOptions?.displayGraph

        const allProviders = this._discoveryService.getProviders()

        const markedProviders = this._filterByMetadata(allProviders, [
            'INJ_CONFIG_MARK',
        ])

        if (!markedProviders.length) {
            this._logger.warn(
                `Marked providers not found! Skip config injection.`,
            )
            return
        }

        const modules = [...this._modulesContainer.values()]

        this._logger.debug(
            `Start search namespaces in ${modules.length} modules...`,
        )

        const containsNamespaces = modules.filter((m) => {
            if (!m.providers.size) {
                this._logger.debug(`Module ${m.name} doesn't have providers!`)
                return false
            }

            const providers = [...m.providers.values()]

            const filtered = this._filterByMetadata(providers, [
                'INJ_CONFIG_MARK',
            ])

            return filtered.length > 0
        })

        if (!containsNamespaces.length) {
            this._logger.warn(`Any namespace with config injection not found!`)
            return
        }

        this._logger.debug(
            `Found ${containsNamespaces.length} namespace modules.`,
        )

        const markedProvidersIds = markedProviders.map((p) => p.id)

        containsNamespaces.forEach((module) => {
            this._verbose(`Process module: ${module.name}...\n`)

            const allNamespaces: string[] = []

            const moduleNamespace = Reflect.getOwnMetadata(
                GLOBAL_CONFIG_NS,
                module.metatype,
            )

            const moduleProviders = [...module.providers.values()]

            const targetProviders = moduleProviders.filter((p) =>
                markedProvidersIds.includes(p.id),
            )

            targetProviders.forEach((provider) => {
                this._verbose(`Process provider: ${provider.name}...\n`)

                const providerNamespace = Reflect.getOwnMetadata(
                    GLOBAL_CONFIG_NS,
                    provider.metatype,
                )

                const globalNamespace: string[] = [
                    moduleNamespace,
                    providerNamespace,
                ].filter((v) => !!v)

                const selfParams: SelfParam[] =
                    Reflect.getOwnMetadata(
                        SELF_DECLARED_DEPS_METADATA,
                        provider.metatype,
                    ) || []

                const propertyDeps: PropertyDeps[] =
                    Reflect.getOwnMetadata(
                        PROPERTY_DEPS_METADATA,
                        provider.metatype,
                    ) || []

                const localConfigMetadata = Reflect.getOwnMetadata(
                    LOCAL_CONFIG_NS,
                    provider.metatype,
                ) as ConfigMetadata

                this._verbose(
                    `localConfigMetadata: ${JSON.stringify(
                        localConfigMetadata,
                    )}`,
                )

                const newSelfParam: SelfParam[] = []
                const newPropertyDeps: PropertyDeps[] = []

                const containerByKey: Record<string, ConfigContainer> = {}

                Object.entries(localConfigMetadata).forEach(([key, value]) => {
                    const fullNamespace = [...globalNamespace]

                    let injectToken = EMPTY_CONFIG

                    const isEmpty = value.includes(EMPTY_CONFIG)

                    const isLocalNamespace =
                        !isEmpty || fullNamespace.length > 0

                    if (isLocalNamespace) {
                        injectToken = value

                        if (!isEmpty) {
                            fullNamespace.push(injectToken)
                        }
                    }

                    const container = new ConfigContainer(fullNamespace, loader)

                    if (isParamKey(key)) {
                        const index = Number(getPKey(key))

                        newSelfParam.push({
                            index,
                            param: injectToken,
                        })

                        containerByKey[injectToken] = container
                    }

                    if (isPropKey(key)) {
                        const propKey = getPKey(key)

                        newPropertyDeps.push({
                            key: propKey,
                            type: injectToken,
                        })
                    }

                    module.addProvider({
                        provide: injectToken,
                        useValue: container,
                    })

                    this._verbose(`Process [${key}, ${value}] metadata...`)
                    this._verbose(`Add inject token: ${injectToken}`)

                    if (showGraph) {
                        allNamespaces.push(fullNamespace.join('_'))
                    }
                })

                this._verbose(`newSelfParam: ${JSON.stringify(newSelfParam)}`)
                this._verbose(
                    `newPropertyDeps: ${JSON.stringify(newPropertyDeps)}`,
                )

                if (newSelfParam.length) {
                    const newSelfParamIdx = newSelfParam.map((p) => p.index)

                    const newParamByIndex = newSelfParam.reduce<
                        Record<string, string>
                    >((acc, curr) => {
                        acc[curr.index.toString()] = curr.param
                        return acc
                    }, {})

                    const otherSelfParam = selfParams.filter(
                        (p) => !newSelfParamIdx.includes(p.index),
                    )

                    const oldMetatype = provider.metatype

                    const oldInject = provider.inject

                    const factory: FactoryProvider = {
                        provide: provider.metatype,
                        inject: [...(oldInject || [])],
                        useFactory: (...params) => {
                            this._verbose(
                                `Factory call of ${provider.name} wrapper.`,
                            )

                            const updatedParams: unknown[] = params.map(
                                (param, idx) => {
                                    const newParam = newParamByIndex[idx]

                                    const container =
                                        containerByKey[newParam || '']

                                    if (container) {
                                        return container
                                    } else {
                                        return param
                                    }
                                },
                            )

                            if (oldMetatype.constructor) {
                                return new (oldMetatype as Type)(
                                    ...updatedParams,
                                )
                            } else {
                                return oldMetatype.call(updatedParams)
                            }
                        },
                    }

                    provider.mergeWith(factory)

                    copyMetadata(oldMetatype, provider.metatype)

                    Reflect.defineMetadata(
                        SELF_DECLARED_DEPS_METADATA,
                        [...otherSelfParam, ...newSelfParam],
                        provider.metatype,
                    )
                }

                if (newPropertyDeps.length) {
                    const newPropertyDepsKeys = newPropertyDeps.map(
                        (p) => p.key,
                    )

                    const otherPropertyDeps = propertyDeps.filter(
                        (p) => !newPropertyDepsKeys.includes(p.key),
                    )

                    Reflect.defineMetadata(
                        PROPERTY_DEPS_METADATA,
                        [...otherPropertyDeps, ...newPropertyDeps],
                        provider.metatype,
                    )
                }
            })

            if (showGraph && allNamespaces.length) {
                const moduleGraph: Record<string, Set<string>> = {}

                allNamespaces.forEach((n) => {
                    const parts = n.split('_')

                    for (let i = 0; i < parts.length; i++) {
                        const current = parts[i]

                        if (!moduleGraph[current]) {
                            moduleGraph[current] = new Set()
                        }

                        const next = parts[i + 1]

                        if (next) {
                            moduleGraph[current].add(next)
                        }
                    }
                })

                const space = ' '

                const visualizeGraph = (
                    graph: Record<string, Set<string>>,
                    node: string,
                    indent: string = '',
                ): string => {
                    let str = `\n${indent} ${node}`

                    const neighbors = graph[node]
                    if (neighbors) {
                        neighbors.forEach((neighbor) => {
                            const r = visualizeGraph(
                                graph,
                                neighbor,
                                indent + space.repeat(4),
                            )
                            str = str.concat(r)
                        })
                    }
                    return str
                }

                const allNodes = new Set(Object.keys(moduleGraph))
                const childNodes = new Set<string>()
                Object.values(moduleGraph).forEach((neighbors) => {
                    neighbors.forEach((neighbor) => {
                        childNodes.add(neighbor)
                    })
                })

                const rootNodes = [...allNodes].filter(
                    (node) => !childNodes.has(node),
                )

                let logStr = ''

                rootNodes.forEach((rootNode) => {
                    const r = visualizeGraph(moduleGraph, rootNode)
                    logStr = logStr.concat(r)
                })

                const arrow = '- >'

                const shift = space.repeat(
                    module.name.length + arrow.length + 2,
                )

                const lines = logStr.split('\n')

                const finalStr = lines
                    .slice(1, lines.length)
                    .map((s, idx) => {
                        if (idx === 0) {
                            return `\n${module.name} ${arrow} ${s}`
                        }

                        return `\n${shift}${s}`
                    })
                    .join()

                this._logger.debug(finalStr)
            }
        })
    }

    private _filterByMetadata<T extends any, TWrapper extends WrapperLike<T>>(
        wrappers: TWrapper[],
        filterKeys: METADATA_KEYS_TYPE[],
    ): TWrapper[] {
        const filtered: TWrapper[] = []

        for (const wrapper of wrappers) {
            if (!wrapper.metatype || !wrapper.instance) {
                continue
            }

            const metadataKeys = Reflect.getOwnMetadataKeys(wrapper.metatype)
            const checks = filterKeys.map((mK) => metadataKeys.includes(mK))

            if (!checks.includes(false)) {
                filtered.push(wrapper)
            }
        }

        return filtered
    }

    private _verbose(str: string): void {
        if (this._isVerbose) {
            this._logger.verbose(str)
        }
    }
}
