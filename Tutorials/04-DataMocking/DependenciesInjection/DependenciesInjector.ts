import type Dependencies from "./Dependencies";
import { Logger, ClassRequiredInitializationHasNotBeenExecutedError, isNull } from "@yamato-daiwa/es-extensions";


export default abstract class DependenciesInjector {

  private static dependencies: Dependencies | null = null;

  public static setDependencies(dependencies: Dependencies): void {
    DependenciesInjector.dependencies = dependencies;
  }

  private static getDependencies(): Dependencies {

    if (isNull(DependenciesInjector.dependencies)) {
      Logger.throwErrorAndLog({
        errorInstance: new ClassRequiredInitializationHasNotBeenExecutedError({
          className: "FrontServerDependenciesInjector",
          initializingMethodName: "getDependencies"
        }),
        occurrenceLocation: "FrontServerDependenciesInjector.[dependency] -> " +
            "FrontServerDependenciesInjector.getDependencies()",
        title: ClassRequiredInitializationHasNotBeenExecutedError.localization.defaultTitle
      });
    }


    return DependenciesInjector.dependencies;

  }


  public static get gateways(): Dependencies.Gateways {
    return DependenciesInjector.getDependencies().gateways;
  }

}
