import {
  INestApplication,
  Inject,
  Injectable,
  Logger,
  Module,
  OnModuleInit,
} from "@nestjs/common"
import { NestFactory } from "@nestjs/core"

import { ConfigContainer } from "./classes"
import { ConfiguratorModule } from "./configurator.module"
import { ConfigNamespace, InjectConfig } from "./decorators"
import { ConfigLoader } from "./interfaces"

const shutdown = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      process.kill(process.pid, "SIGTERM")
      resolve()
    }, ms)
  })
}

const NS_ROOT = "ROOT"

const NS_A = "A"
const NS_B = "B"

const NS_LOCAL1 = "LOCAL1"
const NS_LOCAL2 = "LOCAL2"

type ConfigTest = ConfigContainer<string[]>

@Injectable()
class TestServiceA {
  @Inject("junk") private _j1: string = ""

  constructor(@Inject("junk") private _j2: string) {}
}

@Injectable()
class InjectedService implements OnModuleInit {
  @InjectConfig() private _privateProperty1 = {} as ConfigTest
  @Inject("junk") private _j0: string = ""

  private readonly _logger = new Logger(InjectedService.name)

  @InjectConfig() _publicProperty1 = {} as ConfigTest

  @InjectConfig(NS_LOCAL1) private _privateProperty2 = {} as ConfigTest
  @Inject("funk") private _j1: string = ""
  @InjectConfig(NS_LOCAL2) _publicProperty2 = {} as ConfigTest

  private readonly _publicParam1: string[]
  private readonly _publicParam2: string[]

  isValid = false
  initValid = false

  constructor(
    @Inject("funk") private _j2: string,
    @InjectConfig(NS_LOCAL2) _publicParam1: ConfigTest,
    @Inject("junk") private _j4: string,
    @InjectConfig() _publicParam2: ConfigTest,
    @Inject("funk") _j3: string,
    private readonly _a: TestServiceA,
    @InjectConfig(NS_LOCAL1) private readonly _privateParam1: ConfigTest,
    @Inject("junk") _j5: string,
    @InjectConfig(NS_LOCAL2) private _privateParam2: ConfigTest
  ) {
    this._publicParam1 = _publicParam1.unwrap()
    this._publicParam2 = _publicParam2.unwrap()

    const isFunk = ![_j2, _j3].map((f) => f === "punk").includes(false)
    const isJunk = ![_j4, _j5].map((j) => !!j).includes(false)

    const validPubPm1 = this._publicParam1[1] === NS_LOCAL2
    const validPubPm2 = this._publicParam2[0] === NS_ROOT

    this.initValid = validPubPm1 && validPubPm2 && isFunk && isJunk

    this._logger.debug(
      `init validity: ${JSON.stringify({ validPubPm1, validPubPm2 })}`
    )
  }

  onModuleInit() {
    this.isValid = this.valid()
  }

  valid(): boolean {
    const validPPy1 = this._privateProperty1.unwrap()[0] === NS_ROOT
    const validPPy2 = this._privateProperty2.unwrap()[1] === NS_LOCAL1

    const validPubPy1 = this._publicProperty1.unwrap()[0] === NS_ROOT
    const validPubPy2 = this._publicProperty2.unwrap()[1] === NS_LOCAL2

    const validPPm1 = this._privateParam1.unwrap()[1] === NS_LOCAL1
    const validPPm2 = this._privateParam2.unwrap()[1] === NS_LOCAL2

    const validPubPm1 = this._publicParam1[1] === NS_LOCAL2
    const validPubPm2 = this._publicParam2[0] === NS_ROOT

    const isFunk = ![this._j0].map((f) => f === "punk").includes(false)
    const isJunk = ![this._j1].map((j) => !!j).includes(false)

    const validity = {
      validPPy1,
      validPPy2,
      validPubPy1,
      validPubPy2,
      validPPm1,
      validPPm2,
      validPubPm1,
      validPubPm2,
    }

    this._logger.debug(`validity: ${JSON.stringify(validity)}`)

    return !Object.values(validity).includes(false)
  }
}

@Injectable()
class TestServiceB {
  constructor(private readonly _b: InjectedService) {}
}

@ConfigNamespace(NS_ROOT)
@Module({
  providers: [
    InjectedService,
    TestServiceA,
    TestServiceB,
    { provide: "junk", useValue: {} },
    { provide: "funk", useValue: "punk" },
  ],
})
class TestModule {}

const testLogger = new Logger("ConfigLoader")

const testLoader: ConfigLoader = {
  load: (namespace) => {
    testLogger.debug(`load: ${namespace}`)
    return namespace
  },
  loadAsync: async (namespace) => {
    testLogger.debug(`loadAsync: ${namespace}`)
    return namespace
  },
}

@Module({
  imports: [
    ConfiguratorModule.forRoot({
      loader: testLoader,
      verbose: true,
      throwInEmptyConfig: true,
      injectionOptions: { displayGraph: true },
    }),
    TestModule,
  ],
})
class TestAppModule {}

describe("ConfiguratorModule", () => {
  let app: INestApplication

  let injectedService: InjectedService

  // process.env.NEST_DEBUG = 'true'

  beforeAll(async () => {
    // const moduleRef = await Test.createTestingModule({
    //     imports: [TestAppModule],
    // })
    //     .setLogger(new Logger())
    //     .compile()

    // app = moduleRef.createNestApplication()

    app = await NestFactory.create(TestAppModule)

    injectedService = app.get<InjectedService>(InjectedService)

    app.useLogger(new Logger())
    app.enableShutdownHooks()
  })

  test("onModuleInit", async () => {
    await app.init()

    // await shutdown(3000)
  })

  test("all injected configs should be valid", () => {
    const { isValid, initValid } = injectedService

    expect(initValid).toBe(true)
    expect(isValid).toBe(true)
    expect(injectedService.valid()).toBe(true)
  })
})
