import { Type } from '@nestjs/common'

export type WrapperLike<T = any> = {
    instance: T
    metatype: Function | Type<T>
}
