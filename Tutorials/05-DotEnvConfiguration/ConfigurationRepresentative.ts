import Configuration from "./Configuration";
import type ConfigurationFromDotEnvFile from "./ConfigurationFromDotEnvFile";

import { ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { Logger, ClassRequiredInitializationHasNotBeenExecutedError, isNull } from "@yamato-daiwa/es-extensions";


export default class ConfigurationRepresentative {

  private static config: Configuration | null = null;


  public static initialize(
    configFromDotEnvFile: ConfigurationFromDotEnvFile
  ): void {
    ConfigurationRepresentative.config = {
      IP_Address: configFromDotEnvFile.IP_ADDRESS ?? "127.0.0.1",
      HTTP_Port: configFromDotEnvFile.HTTP_PORT ?? ProtocolDependentDefaultPorts.HTTP
    }
  }


  public static get IP_Address(): string {
    return ConfigurationRepresentative.getConfigWhichExpectedToBeInitialized().IP_Address;
  }

  public static get HTTP_Port(): number {
    return ConfigurationRepresentative.getConfigWhichExpectedToBeInitialized().HTTP_Port;
  }


  private static getConfigWhichExpectedToBeInitialized(): Configuration {

    if (isNull(ConfigurationRepresentative.config)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRequiredInitializationHasNotBeenExecutedError({
          className: "ConfigRepresentative",
          initializingMethodName: "initialize"
        }),
        title: ClassRequiredInitializationHasNotBeenExecutedError.localization.defaultTitle,
        occurrenceLocation: "ConfigRepresentative.getConfigWhichExpectedToBeInitialized()"
      });
    }


    return ConfigurationRepresentative.config;
  }
}
