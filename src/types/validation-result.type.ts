export type ValidationResult<T = any> =
    | {
          error?: Error
          value: T
      }
    | {
          error: Error
          value?: T
      }
