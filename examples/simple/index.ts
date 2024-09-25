import {
  Injectable,
  Logger,
  Module,
  OnApplicationBootstrap,
} from "@nestjs/common"
import { NestFactory } from "@nestjs/core"

import {
  ConfigContainer,
  ConfigLoader,
  ConfigNamespace,
  ConfiguratorModule,
  ConfiguratorModuleConfig,
  InjectConfig,
} from "../../src"

// Some config source
const CONFIG_SOURCE = {
  SOURCE: {
    A: {
      value: "hello",
    },
    B: {
      value: "world",
    },
  },
}

type ConfigObj = {
  value: string
}

@Injectable()
@ConfigNamespace("A")
class ServiceA implements OnApplicationBootstrap {
  private readonly _logger = new Logger(ServiceA.name)

  constructor(
    @InjectConfig() private readonly _config: ConfigContainer<ConfigObj>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const value = this._config.unwrap()

    this._logger.log(`Value: ${JSON.stringify(value)}`)
  }
}

@Injectable()
@ConfigNamespace("B")
class ServiceB implements OnApplicationBootstrap {
  private readonly _logger = new Logger(ServiceB.name)

  constructor(
    @InjectConfig() private readonly _config: ConfigContainer<ConfigObj>
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const value = this._config.unwrap()

    this._logger.log(`Value: ${JSON.stringify(value)}`)
  }
}

@ConfigNamespace("SOURCE")
@Module({ providers: [ServiceA, ServiceB] })
class SimpleModule {}

const loader: ConfigLoader = {
  load: (namespace: string[]): any => {
    return namespace.reduce((acc, curr) => acc[curr], CONFIG_SOURCE as any)
  },
  loadAsync: async (namespace: string[]): Promise<any> => {
    return namespace.reduce((acc, curr) => acc[curr], CONFIG_SOURCE as any)
  },
}

const config: ConfiguratorModuleConfig = {
  loader,
  injectionOptions: {
    displayGraph: true,
  },
  verbose: true,
}

@Module({ imports: [ConfiguratorModule.forRoot(config), SimpleModule] })
class AppModule {}

async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule)

  await app.listen(3010)
}

main()
