
# ConfiguratorLib

ConfiguratorLib is a NestJS module designed to facilitate the independent injection and loading of configurations for each service. It promotes clean, modular, and scalable code by enabling services to manage their configurations independently without tight coupling.

- [ConfiguratorLib](#configuratorlib)
  - [Motivation](#motivation)
  - [Features](#features)
  - [Installation](#installation)
  - [Getting Started](#getting-started)
  - [When to Use ConfiguratorLib](#when-to-use-configuratorlib)
    - [Good Use Cases](#good-use-cases)
    - [When to Avoid or Use with Caution](#when-to-avoid-or-use-with-caution)
  - [ConfiguratorLib vs. @nestjs/config](#configuratorlib-vs-nestjsconfig)
    - [Overview](#overview)
    - [@nestjs/config](#nestjsconfig)
    - [ConfiguratorLib](#configuratorlib-1)
    - [Which One to Choose?](#which-one-to-choose)
  - [Compatibility](#compatibility)
  - [Contributing](#contributing)
  - [License](#license)

## Motivation

In complex NestJS applications, managing configuration settings for different services can lead to tightly coupled code and difficulties in maintaining or extending functionality. As your application grows, the need for a modular approach to configuration management becomes more apparent.

ConfiguratorLib addresses these challenges by providing a decentralized way to manage configuration settings, allowing services to load and inject their configurations independently. This reduces boilerplate code, simplifies service interactions, and supports independent development and scaling.

## Features

- **Independent Configuration Management**: Inject and load configurations independently for each service, promoting modular design.
- **Decoupled Services**: Services do not need to be aware of each other's configurations, reducing interdependencies.
- **Flexible Config Loading**: Supports synchronous and asynchronous loading of configurations from various sources.
- **Scalable Architecture**: Easily add or modify configurations without altering existing service logic, enhancing flexibility.

## Installation

You can install ConfiguratorLib using npm, yarn, or pnpm:

```bash
# npm
npm install @diexpkg/configurator

# yarn
yarn add @diexpkg/configurator

# pnpm
pnpm install @diexpkg/configurator
```

## Getting Started

To start using ConfiguratorLib in your NestJS application, follow these steps:

1. **Import the ConfiguratorModule**: Include `ConfiguratorModule` in your `AppModule`. It's recommended to keep this import in the `AppModule` because `ConfiguratorModule` is a global module.

    ```typescript
    import { Module } from '@nestjs/common';
    import { ConfiguratorModule } from '@diexpkg/configurator';

    @Module({
      imports: [ConfiguratorModule.forRoot()],
    })
    export class AppModule {}
    ```

2. **Define a ConfigLoader**: The `ConfigLoader` is responsible for fetching the configuration based on namespaces. Define a loader that suits your configuration source (e.g., environment variables, external APIs).

    ```typescript
    const load = (namespace: string[]) => {
      const fullEnv = namespace.map(ns => ns.toUpperCase()).join('_');
      return process.env[fullEnv];
    };

    export const envLoader: ConfigLoader = {
      load,
      loadAsync: async (nm) => load(nm),
    };
    ```

3. **Annotate Modules and Services with Namespaces**: Use the `@ConfigNamespace` decorator to define a unique namespace for your modules and services. This allows the loader to correctly identify and fetch the relevant configuration.

    ```typescript
    import { Injectable, Module } from '@nestjs/common';
    import { ConfigNamespace, InjectConfig, ConfigContainer } from '@diexpkg/configurator';

    @ConfigNamespace("Role")
    @Module({
      providers: [UserService, AdminService],
    })
    export class RoleModule {}

    @ConfigNamespace("User")
    @Injectable()
    class UserService {
      constructor(@InjectConfig() private readonly _userConfig: ConfigContainer) {}
    }

    @ConfigNamespace("Admin")
    @Injectable()
    class AdminService {
      constructor(@InjectConfig() private readonly _adminConfig: ConfigContainer) {}
    }
    ```

4. **Inject Configuration in Services**: Use the `@InjectConfig()` decorator to inject the configuration container into your service. The configuration will be automatically loaded based on the service’s namespace.

    ```typescript
    import { Injectable } from '@nestjs/common';
    import { InjectConfig, ConfigContainer } from '@diexpkg/configurator';

    @ConfigNamespace('User')
    @Injectable()
    class UserService {
      constructor(@InjectConfig() private readonly _userConfig: ConfigContainer) {}
    }
    ```

## When to Use ConfiguratorLib

### Good Use Cases

- **Complex Applications**: Ideal for applications with multiple services that require distinct configurations.
- **Modular Architectures**: Useful in systems where services are developed independently, avoiding tight coupling.
- **Dynamic Configurations**: Beneficial in scenarios where configurations need to be loaded from various sources at runtime.

### When to Avoid or Use with Caution

- **Simple Applications**: Might be overkill for small applications with few services and straightforward configurations.
- **Performance-Sensitive Systems**: Loading configurations dynamically introduces a slight overhead, which may not be suitable for high-performance requirements.
- **Complex Config Management**: Overuse of dynamic configuration loading can lead to harder-to-maintain code if not managed carefully.

## ConfiguratorLib vs. @nestjs/config

### Overview

Both `ConfiguratorLib` and `@nestjs/config` serve the purpose of managing configuration settings within NestJS applications, but they differ significantly in their approach and use cases.

### @nestjs/config

- **Centralized Configuration Management**: Provides a global configuration service that is loaded at application startup. It centralizes configuration management and is ideal for applications with relatively stable and shared configuration requirements.
- **Environment Variable Focused**: Primarily revolves around loading configurations from environment variables and `.env` files. It offers a straightforward and familiar approach for most Node.js applications.
- **Simplicity**: Ideal for small to medium-sized applications where the configuration requirements are straightforward and do not require dynamic or service-specific configurations.
- **Ease of Use**: Out-of-the-box functionality with minimal setup. It’s easy to integrate and requires little boilerplate.

### ConfiguratorLib

- **Decentralized Configuration Management**: Allows each service or module to load its configuration independently, promoting modular and decoupled architectures.
- **Dynamic Loading**: Supports both synchronous and asynchronous loading of configurations at runtime, making it suitable for applications where configurations can change dynamically or are fetched from various sources.
- **Granular Control**: Provides more control over how and when configurations are loaded, with the ability to use namespaces to organize configurations more effectively.
- **Scalability**: Better suited for large-scale applications where different parts of the system may have vastly different configuration requirements.

### Which One to Choose?

- **Use `@nestjs/config` if**:
  - You have a centralized and relatively static configuration setup.
  - You prefer simplicity and ease of use with minimal setup.
  - Your application relies primarily on environment variables and `.env` files.

- **Use `ConfiguratorLib` if**:
  - You need a more modular and decentralized approach to configuration management.
  - Your application requires dynamic configuration loading, possibly from multiple sources.
  - You have a complex or large-scale application with different services needing independent configurations.

## Compatibility

ConfiguratorLib is compatible with NestJS versions X.X.X and above. Ensure your project is using a compatible version of NestJS to avoid potential issues.
It has been tested with the following versions:

- NestJS 10.X.X

## Contributing

Contributions are welcome! If you'd like to contribute, please follow the guidelines in the [CONTRIBUTING.md](CONTRIBUTING.md) file. Feel free to open issues for any bugs or feature requests.

## License

[MIT licensed](LICENSE)
