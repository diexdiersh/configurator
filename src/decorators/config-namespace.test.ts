import { GLOBAL_CONFIG_NS } from '../constants'
import { ConfigNamespace } from './config-namespace.decorator'

describe('ConfigNamespace', () => {
    const metadata = 'KEY'
    let decorator: ClassDecorator

    let classTest: Function

    beforeEach(() => {
        decorator = ConfigNamespace(metadata)

        classTest = class TestClass {}
    })

    test(`should define metadata`, () => {
        decorator(classTest)

        const definedValue = Reflect.getOwnMetadata(GLOBAL_CONFIG_NS, classTest)

        expect(definedValue).toBe(metadata)
    })

    test('should trow error if used twice', () => {
        decorator(classTest)

        const throwCall = () => {
            decorator(classTest)
        }

        expect(throwCall).toThrow()
    })
})
