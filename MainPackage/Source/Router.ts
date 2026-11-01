/* eslint-disable max-depth -- Keep current nesting level for this version. */

/* ━━━ < Imports ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ┅┅┅ Framework Constituents ┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅ */
import type Request from "./Request";
import type Response from "./Response";
import type Controller from "./Controller";
import type { ControllerInheritingClass } from "./Controller";
import type URI_QueryParametersDeserializer from "./URI_QueryParametersDeserializer";
import { HTTP_Methods, SpecificHTTP_Methods } from "./HTTP_Methods";

/* ┅┅┅ Utils ┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅ */
import {
  isUndefined,
  isNotUndefined,
  removeSpecificCharacterFromCertainPosition,
  splitString,
  InvalidConfigError,
  Logger
} from "@yamato-daiwa/es-extensions";
import removeDanglingSlashes from "./UtilsIncubator/removeDanglingSlashes";
/* ━━━ Imports > ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */


abstract class Router {

  /* ━━━ Public Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  public static normalizeRouting(routesAndHandlersData: Router.RawRouting): Router.NormalizedRouting {

    const mappedRoutesAndHandlers: Map<Router.Route, Router.RouteHandler> = new Map();

    const sortedByHTTP_MethodWildcardRoutes: Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers = {
      [HTTP_Methods.get]: {},
      [HTTP_Methods.post]: {},
      [HTTP_Methods.create]: {},
      [HTTP_Methods.put]: {},
      [HTTP_Methods.delete]: {},
      [HTTP_Methods.options]: {},
      [HTTP_Methods.head]: {},
      [HTTP_Methods.connect]: {},
      [HTTP_Methods.trace]: {},
      [HTTP_Methods.patch]: {}
    };

    let notFoundMasterHandler: Router.RouteHandler | undefined;

    for (const polymorphicArrayElement of routesAndHandlersData) {

      if ("handler" in polymorphicArrayElement) {

        Router.collectRouteAndHandler(
          polymorphicArrayElement,
          mappedRoutesAndHandlers,
          sortedByHTTP_MethodWildcardRoutes
        );

      } else if ("notFound" in polymorphicArrayElement) {

        if (isNotUndefined(notFoundMasterHandler)) {
          Logger.throwErrorWithFormattedMessage({
            errorInstance:
                new InvalidConfigError({
                  mentionToConfig: "YDF.RawConfig",
                  messageSpecificPart: "Multiple \"not found\" handlers found while only one as maximum allowed."
                }),
            title: InvalidConfigError.localization.defaultTitle,
            occurrenceLocation: "Router.normalizeRouting(routesAndHandlersData)"
          });
        }

        notFoundMasterHandler = polymorphicArrayElement.notFound;

      } else {

        const SpecificControllerClass: new () => Controller = polymorphicArrayElement;
        const controller: Controller = new SpecificControllerClass();

        Router.collectRoutesOfController(
          controller,
          mappedRoutesAndHandlers,
          sortedByHTTP_MethodWildcardRoutes
        );

      }

    }


    const normalizedRouting: Router.NormalizedRouting = {
      [HTTP_Methods.get]: {},
      [HTTP_Methods.post]: {},
      [HTTP_Methods.create]: {},
      [HTTP_Methods.put]: {},
      [HTTP_Methods.delete]: {},
      [HTTP_Methods.options]: {},
      [HTTP_Methods.head]: {},
      [HTTP_Methods.connect]: {},
      [HTTP_Methods.trace]: {},
      [HTTP_Methods.patch]: {},
      notFound: notFoundMasterHandler
    };

    /* [ Approach ]
     * Register wildcard routers first to normalized routing to reduce the complexity of
     *   registration of non-wildcard routes. */
    Router.registerWildcardRoutes(sortedByHTTP_MethodWildcardRoutes, normalizedRouting);

    for (const [ route, handler ] of mappedRoutesAndHandlers.entries()) {

      /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-unsafe-enum-assignment --
       * All routes with `HTTP_Method === HTTP_Methods.all` has been filtered out above. */
      const targetHTTP_Method: SpecificHTTP_Methods = route.HTTP_Method as SpecificHTTP_Methods;

      const normalizedRoutesOfCurrentHTTP_Method: Router.NormalizedRouting.RoutesOfSpecificHTTP_Method =
          normalizedRouting[targetHTTP_Method];

      Router.addRouteAndHandlerPairToNormalizedRoutesOfSpecificHTTP_MethodMutableObject({
        normalizedRoutesOfTargetHTTP_Method: normalizedRoutesOfCurrentHTTP_Method,
        route,
        handler,
        wildcardRoutesOfTargetHTTP_Method: sortedByHTTP_MethodWildcardRoutes[targetHTTP_Method]
      });

    }

    console.log("================================");
    console.dir(normalizedRouting, { depth: null });

    return normalizedRouting;

  }

  public static getRouteMatch(
    {
      URI_Path,
      HTTP_Method,
      normalizedRouting
    }: {
      URI_Path: string;
      HTTP_Method: SpecificHTTP_Methods;
      normalizedRouting: Router.NormalizedRouting;
    }
  ): Router.RouteMatch | null {

    const matchesActualForCurrentHTTP_Method: Router.NormalizedRouting.RoutesOfSpecificHTTP_Method =
        normalizedRouting[HTTP_Method];
    const URI_PathSegments: Array<string> = removeDanglingSlashes(URI_Path, { leading: true, trailing: true }).split("/");
    const routePathParameters: Router.RoutePathParameters = {};

    if (URI_PathSegments.length === 1 && URI_PathSegments[0].length === 0) {

      const routeForRootPath: Router.NormalizedRouting.RouteForPathOfSpecificDepth | undefined =
          matchesActualForCurrentHTTP_Method["/"]?.routeForPathOfCurrentLength;

      return isNotUndefined(routeForRootPath) ?
          {
            handler: routeForRootPath.handler,
            routePathParameters,
            routePathTemplate: "/",
            ...isNotUndefined(routeForRootPath.URI_QueryParametersDeserializer) ?
                { URI_QueryParametersDeserializer: routeForRootPath.URI_QueryParametersDeserializer } : null
          } :
          null;

    }


    let matchesForCurrentPathSegmentsCount: Router.NormalizedRouting.RoutingDataForSpecificPathSegment | undefined =
        matchesActualForCurrentHTTP_Method[URI_PathSegments[0]];

    let fallbackRouteForCurrentPathSegmentsCount: Router.NormalizedRouting.RouteForPathOfSpecificDepth | undefined;

    for (const [ index ] of URI_PathSegments.entries()) {

      if (isUndefined(matchesForCurrentPathSegmentsCount)) {

        if (isNotUndefined(fallbackRouteForCurrentPathSegmentsCount)) {
          return {
            routePathTemplate: fallbackRouteForCurrentPathSegmentsCount.pathTemplate,
            routePathParameters,
            handler: fallbackRouteForCurrentPathSegmentsCount.handler,
            ...isNotUndefined(
              fallbackRouteForCurrentPathSegmentsCount.URI_QueryParametersDeserializer
            ) ?
                {
                  URI_QueryParametersDeserializer: fallbackRouteForCurrentPathSegmentsCount.URI_QueryParametersDeserializer
                } :
                null
          };
        }

        return isNotUndefined(normalizedRouting.notFound) ?
            {
              routePathTemplate: "*",
              routePathParameters: {},
              handler: normalizedRouting.notFound
            } :
            null;

      }


      const isLastSegment: boolean = index === URI_PathSegments.length - 1;

      if (isLastSegment) {

        if (isNotUndefined(matchesForCurrentPathSegmentsCount.routeForPathOfCurrentLength)) {
          return {
            handler: matchesForCurrentPathSegmentsCount.routeForPathOfCurrentLength.handler,
            routePathTemplate: matchesForCurrentPathSegmentsCount.routeForPathOfCurrentLength.pathTemplate,
            routePathParameters,
            ...isNotUndefined(
              matchesForCurrentPathSegmentsCount.routeForPathOfCurrentLength.URI_QueryParametersDeserializer
            ) ?
                {
                  URI_QueryParametersDeserializer:
                      matchesForCurrentPathSegmentsCount.routeForPathOfCurrentLength.URI_QueryParametersDeserializer
                } :
                null
          };
        }


        return isNotUndefined(fallbackRouteForCurrentPathSegmentsCount) ?
            {
              handler: fallbackRouteForCurrentPathSegmentsCount.handler,
              routePathTemplate: fallbackRouteForCurrentPathSegmentsCount.pathTemplate,
              routePathParameters,
              ...isNotUndefined(
                fallbackRouteForCurrentPathSegmentsCount.URI_QueryParametersDeserializer
              ) ?
                  {
                    URI_QueryParametersDeserializer:
                        fallbackRouteForCurrentPathSegmentsCount.URI_QueryParametersDeserializer
                  } :
                  null
            } :
            null;

      }


      fallbackRouteForCurrentPathSegmentsCount =
          matchesForCurrentPathSegmentsCount.wildcardRouteForPathAtLeastOfCurrentLength ??
              fallbackRouteForCurrentPathSegmentsCount;

      const nextPathSegment: string = URI_PathSegments[index + 1];
      const routingForStaticPathSegmentsAtNextPosition: Router.NormalizedRouting.
          RoutingForStaticPathSegmentsAtNextPosition | undefined =
              matchesForCurrentPathSegmentsCount.routingForStaticPathSegmentsAtNextPosition;

      if (
        isNotUndefined(routingForStaticPathSegmentsAtNextPosition) &&
            isNotUndefined(routingForStaticPathSegmentsAtNextPosition[nextPathSegment])
      ) {
        matchesForCurrentPathSegmentsCount = routingForStaticPathSegmentsAtNextPosition[nextPathSegment];
        continue;
      }


      if (isNotUndefined(matchesForCurrentPathSegmentsCount.routingForRoutePathParameterAtNextPosition)) {

        routePathParameters[matchesForCurrentPathSegmentsCount.
            routingForRoutePathParameterAtNextPosition.parameterName] = nextPathSegment;
        matchesForCurrentPathSegmentsCount = matchesForCurrentPathSegmentsCount.routingForRoutePathParameterAtNextPosition;

        continue;

      }


      /* eslint-disable-next-line no-void --
       * ● Won't set `undefined` because of `no-undefined` rule
       * ● Won't set `null` to avoid the double check for the `undefined` and `null` (performance optimization) */
      matchesForCurrentPathSegmentsCount = void 0;

    }

    return isNotUndefined(normalizedRouting.notFound) ?
        {
          routePathTemplate: "*",
          routePathParameters: {},
          handler: normalizedRouting.notFound
        } :
        null;

  }


  /* ━━━ Protected Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /* ┅┅┅ Routes Registration ┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅ */
  protected static collectRouteAndHandler(
    routeAndHandler: Router.RouteAndHandler,
    mappedRoutesAndHandlers: Map<Router.Route, Router.RouteHandler>,
    sortedByHTTP_MethodWildcardRoutes: Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers
  ): void {

    for (
      const specificHTTP_Method of
          routeAndHandler.HTTP_Method === HTTP_Methods.all ?
              Object.values(SpecificHTTP_Methods) : [ routeAndHandler.HTTP_Method ]
    ) {

      if (routeAndHandler.pathTemplate.endsWith("/*")) {

        const pathWithoutDanglingSlashesAndAsterisk: string =
            routeAndHandler.pathTemplate.
                replace(/^\//u, "").
                replace(/\/\*$/u, "");

        const pathSegmentsCount: number = splitString(pathWithoutDanglingSlashesAndAsterisk, "/").length;

        let routesWithHandlersForCurrentPathSegmentsCount:
            Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined =
                sortedByHTTP_MethodWildcardRoutes[specificHTTP_Method][pathSegmentsCount];

        if (isUndefined(routesWithHandlersForCurrentPathSegmentsCount)) {
          routesWithHandlersForCurrentPathSegmentsCount = {};
          sortedByHTTP_MethodWildcardRoutes[specificHTTP_Method][pathSegmentsCount] =
              routesWithHandlersForCurrentPathSegmentsCount;
        }

        routesWithHandlersForCurrentPathSegmentsCount[pathWithoutDanglingSlashesAndAsterisk] =
            { ...routeAndHandler };

      } else {

        mappedRoutesAndHandlers.set({ ...routeAndHandler, HTTP_Method: specificHTTP_Method }, routeAndHandler.handler);

      }

    }

  }

  protected static collectRoutesOfController(
    controller: Controller,
    mappedRoutesAndHandlers: Map<Router.Route, Router.RouteHandler>,
    sortedByHTTP_MethodWildcardRoutes: Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers
  ): void {

    for (const [ route, handler ] of controller.getRoutesAndHandlers()) {

      for (
        const specificHTTP_Method of
            route.HTTP_Method === HTTP_Methods.all ?
                Object.values(SpecificHTTP_Methods) : [ route.HTTP_Method ]
      ) {

        if (route.pathTemplate.endsWith("/*")) {

          const pathWithoutDanglingSlashesAndAsterisk: string =
            route.pathTemplate.
                replace(/^\//u, "").
                replace(/\/\*$/u, "");

          const pathSegmentsCount: number = splitString(pathWithoutDanglingSlashesAndAsterisk, "/").length;

          let routesWithHandlersForCurrentPathSegmentsCount:
            Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined =
                sortedByHTTP_MethodWildcardRoutes[specificHTTP_Method][pathSegmentsCount];

          if (isUndefined(routesWithHandlersForCurrentPathSegmentsCount)) {
            routesWithHandlersForCurrentPathSegmentsCount = {};
            sortedByHTTP_MethodWildcardRoutes[specificHTTP_Method][pathSegmentsCount] =
                routesWithHandlersForCurrentPathSegmentsCount;
          }

          routesWithHandlersForCurrentPathSegmentsCount[pathWithoutDanglingSlashesAndAsterisk] =
              {
                ...route,
                HTTP_Method: specificHTTP_Method,
                handler
              };

        } else {

          mappedRoutesAndHandlers.set(
            {
              ...isNotUndefined(controller.URI_QueryParametersDeserializer) ?
                  { URI_QueryParametersDeserializer: controller.URI_QueryParametersDeserializer } : null,
              ...route,
              HTTP_Method: specificHTTP_Method
            },
            handler.bind(controller)
          );

        }

      }

    }

  }

  protected static registerWildcardRoutes(
    sortedByHTTP_MethodWildcardRoutes: Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers,
    normalizedRouting: Router.NormalizedRouting
  ): void {

    for (const HTTP_Method of Object.values(SpecificHTTP_Methods)) {

      const routesOfCurrentHTTP_Method: Router.NormalizedRouting.RoutesOfSpecificHTTP_Method =
          normalizedRouting[HTTP_Method];

      const wildcardRoutesMappedByPathsForCurrentHTTP_MethodAndEachSegmentsNumber:
          {
            [ pathSegmentsCount: number ]:
                Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths;
          } =
              // TODO Map this type
              sortedByHTTP_MethodWildcardRoutes[HTTP_Method] as
                  {
                    [ pathSegmentsCount: number ]:
                        Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths;
                  };

      /* [ Theory ] `isEmptyObject` function can not be used here. */
      if (Object.entries(wildcardRoutesMappedByPathsForCurrentHTTP_MethodAndEachSegmentsNumber).length === 0) {
        continue;
      }


      type InterimPath = string;
      const registeredWildcardRoutes: Map<InterimPath, Router.RouteAndHandler> = new Map();


      /* [ Approach ]
       * Soring of `wildcardRoutesMappedByPathsForCurrentHTTP_MethodAndSpecificSegmentsNumber` by segments number
       *   in ascending order is critical for this algorithm. */
      for (
        const [ , wildcardRoutesMappedByPathsForCurrentHTTP_MethodAndSpecificSegmentsNumber ] of
            Object.entries(wildcardRoutesMappedByPathsForCurrentHTTP_MethodAndEachSegmentsNumber).
                toSorted(
                  (
                    [ pathSegmentsStringifiedNumber1 ]:
                        Readonly<[
                          string,
                          Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths
                        ]>,
                    [ pathSegmentsStringifiedNumber2 ]:
                        Readonly<[
                          string,
                          Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths
                        ]>
                  ): number =>
                      (pathSegmentsStringifiedNumber1 < pathSegmentsStringifiedNumber2 ? -1 : 1)
                )
      ) {

        for (
          const [ path, _wildcardRoute ] of
              Object.entries(wildcardRoutesMappedByPathsForCurrentHTTP_MethodAndSpecificSegmentsNumber)
        ) {

          const pathSegments: ReadonlyArray<string> = splitString(path, "/");

          /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions --
           * Has been made undefinable to express that not for every key the value presents, but the undefined values
           *   not being stored parent object. */
          const wildcardRoute: Router.RouteAndHandler = _wildcardRoute as Router.RouteAndHandler;

          let routingDataForCurrentPathSegment: Router.NormalizedRouting.RoutingDataForSpecificPathSegment =
              routesOfCurrentHTTP_Method[pathSegments[0]] ??
              (routesOfCurrentHTTP_Method[pathSegments[0]] = {});

          let bestWildcardRouteForCurrentInterimPath: Router.RouteAndHandler | undefined;

          for (
            let pathSegmentNumber__numerationFrom1: number = 1;
                pathSegmentNumber__numerationFrom1 <= pathSegments.length;
                pathSegmentNumber__numerationFrom1++
          ) {

            const interimPath: string = pathSegments.slice(0, pathSegmentNumber__numerationFrom1).join("/");
            const isLastPathSegment: boolean = pathSegmentNumber__numerationFrom1 === pathSegments.length;

            if (isLastPathSegment) {

              if (isUndefined(routingDataForCurrentPathSegment.wildcardRouteForPathAtLeastOfCurrentLength)) {

                routingDataForCurrentPathSegment.wildcardRouteForPathAtLeastOfCurrentLength = wildcardRoute;
                registeredWildcardRoutes.set(interimPath, wildcardRoute);

              }

              break;

            }


            const previouslyRegisteredWildcardRouteForCurrentInterimPath: Router.RouteAndHandler | undefined =
                registeredWildcardRoutes.get(interimPath);

            if (isNotUndefined(previouslyRegisteredWildcardRouteForCurrentInterimPath)) {
              bestWildcardRouteForCurrentInterimPath = previouslyRegisteredWildcardRouteForCurrentInterimPath;
            }

            if (isNotUndefined(bestWildcardRouteForCurrentInterimPath)) {
              routingDataForCurrentPathSegment.wildcardRouteForPathAtLeastOfCurrentLength =
                  bestWildcardRouteForCurrentInterimPath;
            }


            const nextPathSegment: string = pathSegments[pathSegmentNumber__numerationFrom1];

            if (Router.isSegmentTheRouteParameter(nextPathSegment)) {

              let routingDataForNextPathSegment:
                  Router.NormalizedRouting.RoutingForRouteParameterAtNextPosition | undefined =
                      routingDataForCurrentPathSegment.routingForRoutePathParameterAtNextPosition;

              if (isUndefined(routingDataForNextPathSegment)) {

                routingDataForNextPathSegment = {
                  parameterName: nextPathSegment.replace(/^:/gu, "")
                };

                routingDataForCurrentPathSegment.routingForRoutePathParameterAtNextPosition =
                    routingDataForNextPathSegment;

              }

              routingDataForCurrentPathSegment = routingDataForNextPathSegment;

            } else {

              const routingForStaticPathSegmentsAtNextPosition:
                  Router.NormalizedRouting.RoutingForStaticPathSegmentsAtNextPosition | undefined =
                      routingDataForCurrentPathSegment.routingForStaticPathSegmentsAtNextPosition;

              let routingDataForNextPathSegment:
                  Router.NormalizedRouting.RoutingDataForSpecificPathSegment | undefined =
                      routingForStaticPathSegmentsAtNextPosition?.[nextPathSegment];

              if (isUndefined(routingForStaticPathSegmentsAtNextPosition)) {

                routingDataForNextPathSegment = {};

                routingDataForCurrentPathSegment.routingForStaticPathSegmentsAtNextPosition = {
                  [nextPathSegment]: routingDataForNextPathSegment
                };

              } else if (isUndefined(routingDataForNextPathSegment)) {

                routingDataForNextPathSegment = {};

                routingForStaticPathSegmentsAtNextPosition[nextPathSegment] = routingDataForNextPathSegment;

              }

              routingDataForCurrentPathSegment = routingDataForNextPathSegment;

            }

          }

        }

      }

    }

  }

  protected static addRouteAndHandlerPairToNormalizedRoutesOfSpecificHTTP_MethodMutableObject(
    {
      normalizedRoutesOfTargetHTTP_Method,
      route,
      handler,
      wildcardRoutesOfTargetHTTP_Method
    }: {
      normalizedRoutesOfTargetHTTP_Method: Router.NormalizedRouting.RoutesOfSpecificHTTP_Method;
      route: Router.Route;
      handler: Router.RouteHandler;
      wildcardRoutesOfTargetHTTP_Method: {
        [ pathSegmentsCount: number ]:
            Router.InterimRouting.SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
    }
  ): void {

    if (route.pathTemplate === "/") {

      normalizedRoutesOfTargetHTTP_Method["/"] = {
        routeForPathOfCurrentLength: {
          pathTemplate: "/",
          handler,
          ...isNotUndefined(route.URI_QueryParametersDeserializer) ?
              { URI_QueryParametersDeserializer: route.URI_QueryParametersDeserializer } : null
        }
      };

      return;

    }


    const pathSegments: ReadonlyArray<string> =
        removeDanglingSlashes(route.pathTemplate, { leading: true, trailing: true }).
        split("/");

    let normalizedRoutingDataForSpecificPathSegment: Router.NormalizedRouting.RoutingDataForSpecificPathSegment;
    const normalizedRoutingDataForFirstPathSegment: Router.NormalizedRouting.RoutingDataForSpecificPathSegment | undefined =
        normalizedRoutesOfTargetHTTP_Method[pathSegments[0]];

    if (isNotUndefined(normalizedRoutingDataForFirstPathSegment)) {
      normalizedRoutingDataForSpecificPathSegment = normalizedRoutingDataForFirstPathSegment;
    } else {
      normalizedRoutingDataForSpecificPathSegment = {};
      normalizedRoutesOfTargetHTTP_Method[pathSegments[0]] = normalizedRoutingDataForSpecificPathSegment;
    }

    let wildcardRouteWithHandler: Router.RouteAndHandler | undefined;

    for (const [ pathSegmentNumber__numerationFrom0 ] of pathSegments.entries()) {

      const pathSegmentNumber__numerationFrom1: number = pathSegmentNumber__numerationFrom0 + 1;
      const isLastSegment: boolean = pathSegmentNumber__numerationFrom1 === pathSegments.length;
      const interimPath: string = pathSegments.slice(0, pathSegmentNumber__numerationFrom1).join("/");

      wildcardRouteWithHandler =
          wildcardRoutesOfTargetHTTP_Method[pathSegmentNumber__numerationFrom1]?.[interimPath];

      if (isNotUndefined(wildcardRouteWithHandler)) {

        normalizedRoutingDataForSpecificPathSegment.wildcardRouteForPathAtLeastOfCurrentLength = {
          pathTemplate: wildcardRouteWithHandler.pathTemplate,
          handler: wildcardRouteWithHandler.handler,
          ...isNotUndefined(wildcardRouteWithHandler.URI_QueryParametersDeserializer) ?
              { URI_QueryParametersDeserializer: wildcardRouteWithHandler.URI_QueryParametersDeserializer } : null
        };

      }

      if (isLastSegment) {

        normalizedRoutingDataForSpecificPathSegment.routeForPathOfCurrentLength = {
          pathTemplate: route.pathTemplate,
          handler,
          ...isNotUndefined(route.URI_QueryParametersDeserializer) ?
              { URI_QueryParametersDeserializer: route.URI_QueryParametersDeserializer } : null
        };

        continue;

      }


      const pathSegmentAtNextPosition: string = pathSegments[pathSegmentNumber__numerationFrom0 + 1];

      if (Router.isSegmentTheRouteParameter(pathSegmentAtNextPosition)) {

        if (isUndefined(normalizedRoutingDataForSpecificPathSegment.routingForRoutePathParameterAtNextPosition)) {

          normalizedRoutingDataForSpecificPathSegment.routingForRoutePathParameterAtNextPosition = {
            parameterName:
                removeSpecificCharacterFromCertainPosition({
                  targetString: pathSegmentAtNextPosition,
                  targetCharacter: ":",
                  fromFirstPosition: true
                })
          };
          normalizedRoutingDataForSpecificPathSegment = normalizedRoutingDataForSpecificPathSegment.
              routingForRoutePathParameterAtNextPosition;

          continue;

        }


        normalizedRoutingDataForSpecificPathSegment = normalizedRoutingDataForSpecificPathSegment.
            routingForRoutePathParameterAtNextPosition;

        continue;

      }


      const routingForStaticPathSegmentsAtNextPosition: Router.NormalizedRouting.
          RoutingForStaticPathSegmentsAtNextPosition | undefined =
          normalizedRoutingDataForSpecificPathSegment.routingForStaticPathSegmentsAtNextPosition;

      if (isUndefined(routingForStaticPathSegmentsAtNextPosition)) {

        const nextPathSegmentMatches: Router.NormalizedRouting.RoutingDataForSpecificPathSegment = {};

        normalizedRoutingDataForSpecificPathSegment.routingForStaticPathSegmentsAtNextPosition = {
          [pathSegmentAtNextPosition]: nextPathSegmentMatches
        };

        normalizedRoutingDataForSpecificPathSegment = nextPathSegmentMatches;

        continue;

      }


      let routingDataForStaticPathSegmentAtNextPosition: Router.NormalizedRouting.RoutingDataForSpecificPathSegment | undefined =
          routingForStaticPathSegmentsAtNextPosition[pathSegmentAtNextPosition];

      if (isUndefined(routingDataForStaticPathSegmentAtNextPosition)) {
        routingDataForStaticPathSegmentAtNextPosition = {};
        routingForStaticPathSegmentsAtNextPosition[pathSegmentAtNextPosition] = routingDataForStaticPathSegmentAtNextPosition;
        normalizedRoutingDataForSpecificPathSegment = routingDataForStaticPathSegmentAtNextPosition;
        continue;
      }


      normalizedRoutingDataForSpecificPathSegment = routingDataForStaticPathSegmentAtNextPosition;

    }

  }

  protected static isSegmentTheRouteParameter(targetURL_Segment: string): boolean {
    return targetURL_Segment.startsWith(":");
  }

}


namespace Router {

  export type RawRouting = ReadonlyArray<ControllerInheritingClass | RouteAndHandler | NotFoundHandlerDefinition>;

  export type Route = Readonly<{
    HTTP_Method: HTTP_Methods;
    pathTemplate: string;
    URI_QueryParametersDeserializer?: URI_QueryParametersDeserializer;
  }>;

  export type RouteHandler = (request: Request, response: Response) => Promise<void>;

  /* [ API ] For the user's convenience, it is better to refrain from namespacing of "RouteAndHandlerPair". */
  export type RouteAndHandler = Route & Readonly<{ handler: RouteHandler; }>;

  export type RouteMatch = Readonly<{
    handler: RouteHandler;
    routePathTemplate: string;
    routePathParameters: RoutePathParameters;
    URI_QueryParametersDeserializer?: URI_QueryParametersDeserializer;
  }>;

  export type RoutePathParameters = { [pathSegment: string]: string | undefined; };

  export type NotFoundHandlerDefinition = Readonly<{ notFound: RouteHandler; }>;

  export namespace InterimRouting {

    export type SortedByHTTP_MethodsWildcardRoutesWithHandlers = Readonly<{
      [HTTP_Methods.get]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.post]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.create]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.put]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.delete]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.options]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.head]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.connect]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.trace]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
      [HTTP_Methods.patch]: {
        [ pathSegmentsCount: number ]: SortedByHTTP_MethodsWildcardRoutesWithHandlers.RoutesMappedByPaths | undefined;
      };
    }>;

    export namespace SortedByHTTP_MethodsWildcardRoutesWithHandlers {

      export type RoutesMappedByPaths = {
        [ path: string ]: RouteAndHandler | undefined;
      };

    }

  }

  export type NormalizedRouting = Readonly<{
    [HTTP_Methods.get]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.post]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.create]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.put]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.delete]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.options]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.head]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.connect]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.trace]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    [HTTP_Methods.patch]: NormalizedRouting.RoutesOfSpecificHTTP_Method;
    notFound?: RouteHandler;
  }>;

  export namespace NormalizedRouting {

    export type RoutesOfSpecificHTTP_Method = {
      [pathSegment: string]: RoutingDataForSpecificPathSegment | undefined;
    };

    export type RoutingDataForSpecificPathSegment = {
      routeForPathOfCurrentLength?: RouteForPathOfSpecificDepth;
      wildcardRouteForPathAtLeastOfCurrentLength?: RouteForPathOfSpecificDepth;
      routingForStaticPathSegmentsAtNextPosition?: RoutingForStaticPathSegmentsAtNextPosition;
      routingForRoutePathParameterAtNextPosition?: RoutingForRouteParameterAtNextPosition;
    };

    export type RouteForPathOfSpecificDepth = {
      pathTemplate: string;
      handler: RouteHandler;
      URI_QueryParametersDeserializer?: URI_QueryParametersDeserializer;
    };

    export type RoutingForStaticPathSegmentsAtNextPosition = {
      [routePathSegment: string]: RoutingDataForSpecificPathSegment | undefined;
    };

    export type RoutingForRouteParameterAtNextPosition = RoutingDataForSpecificPathSegment & Readonly<{ parameterName: string; }>;

  }

}


export default Router;
