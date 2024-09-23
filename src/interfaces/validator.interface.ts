import { ValidationResult } from '../types'

export interface Validator {
    validate(value: any, options?: any): ValidationResult
}
