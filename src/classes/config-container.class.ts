import { Logger } from '@nestjs/common'

import { ConfigLoader, Validator } from '../interfaces'

export class ConfigContainer<T = any, TOptions = any> {
    private readonly _logger: Logger

    constructor(
        private readonly _namespace: string[],
        private readonly _loader: ConfigLoader<T>,
    ) {
        this._logger = new Logger(
            `${ConfigContainer.name}: ${_namespace.join('_')}`,
        )
    }

    unwrap(validator?: Validator, options?: TOptions): T {
        const value = this._loader.load(this._namespace)

        if (!validator) {
            return value
        }

        const result = validator.validate(value, options)

        if (result.error) {
            throw result.error
        }

        return result.value
    }

    async unwrapAsync(validator?: Validator, options?: TOptions): Promise<T> {
        const value = await this._loader.loadAsync(this._namespace)
        if (!validator) {
            return value
        }

        const result = validator.validate(value, options)

        if (result.error) {
            this._logger.warn(
                `Validation failed for value: ${JSON.stringify(value)}`,
            )
            throw result.error
        }

        return result.value
    }
}
