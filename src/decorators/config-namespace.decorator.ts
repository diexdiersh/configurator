import { GLOBAL_CONFIG_NS } from '../constants'

export const ConfigNamespace = (namespaceKey: string): ClassDecorator => {
    return (target) => {
        const namespace = Reflect.getOwnMetadata(GLOBAL_CONFIG_NS, target)

        if (namespace) {
            throw new Error(
                `Looks like decorator ${ConfigNamespace.name} has been used twice! Check ${target.name} class.`,
            )
        }

        Reflect.defineMetadata(GLOBAL_CONFIG_NS, namespaceKey, target)
    }
}
