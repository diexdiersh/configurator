# Configurator Lib

## Contents

- [Configurator Lib](#configurator-lib)
  - [Contents](#contents)
  - [Descriptions](#descriptions)
  - [Quick Start](#quick-start)
  - [Examples](#examples)
  - [License](#license)

## Descriptions

Configurator is [Nest](https://github.com/nestjs/nest) module, which helps inject and load specific configs independently for each service.

## Quick Start

To start configurator work, you need to import `ConfiguratorModule` to `AppModule`.
Better to keep import in `AppModule` because `ConfiguratorModule` always import as global module.

```ts
@Module({
    imports: [
        ConfiguratorModule.forRoot(),
    ]
})
export class AppModule {}
```

After that you need to configure `ConfiguratorModule`.
Main property of config object is `loader`.
This is object with two methods: `load` and `loadAsync`, which will called when config will be needed to load.
As a parameter `load` and `loadAsync` accept array of string, which represents path of namespaces to specific place, where config need to be loaded.

For example, we have `Role` modules which have different services for specific roles.
Like roles `User` and `Admin` have owh services `UserService` and `AdminService`, respectively.

So, we will have module `RolesModule` marked with `Role` namespace:

```ts
@ConfigNamespace("Role")
@Module({
    providers: [
        UserService,
        AdminService
    ],
    exports: [],
})
export class RoleModule {}
```

Service `UserService`:

```ts
@Injectable()
@ConfigNamespace("User")
export class UserService {
      constructor(@InjectConfig() private readonly _userConfig: ConfigContainer) {}
}
```

Service `AdminService`:

```ts
@Injectable()
@ConfigNamespace("Admin")
export class AdminService {
      constructor(@InjectConfig() private readonly _adminConfig: ConfigContainer) {}
}
```

Let's in that case load config from env variables.
Loader will concatenate provided namespaces in one string and try get value from `process.env`.

```ts
const load = (namespace: string[]) => {
        const fullEnv = namespace.toUpperCase().join('_')

        return process.env[fullEnv]
    }

export const envLoader: ConfigLoader =  {
        load,
        loadAsync: async (nm) => {
            return load(nm)
        },
}
```

For `UserService` namespace will looks like `["Role", "User"]`, so env will be accessed by `ROLE_USER`

Lets write some value in `.env` file, for example json object which described permission and action.

```env
ROLE_USER={"permission": "restricted", "action": "create"}
```

## Examples

All example can be find in `examples` directory.

## License

[MIT licensed](LICENSE)
