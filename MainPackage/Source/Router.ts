/* ━━━ < Imports ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/* ┅┅┅ Framework Constituents ┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅ */
import type Request from "./Request";
import type Response from "./Response";
import type Controller from "./Controller";
import type { ControllerInheritingClass } from "./Controller";
import type URI_QueryParametersDeserializer from "./URI_QueryParametersDeserializer";

/* ┅┅┅ Utils ┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅ */
import {
  HTTP_Methods,
  isUndefined,
  isNotUndefined,
  removeSpecificCharacterFromCertainPosition,
  filterMap,
  InvalidConfigError,
  Logger
} from "@yamato-daiwa/es-extensions";
import removeDanglingSlashes from "./UtilsIncubator/removeDanglingSlashes";
/* ━━━ Imports > ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */


abstract class Router {

  /* ━━━ Public Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  public static normalizeRouting(routesAndHandlersData: Router.RawRouting): Router.NormalizedRouting {

    const mappedRoutesAndHandlers: Map<Router.Route, Router.RouteHandler> = new Map();
    const mappedWildcardRoutes: Map<string, Router.RouteAndHandler> = new Map();

    let notFoundMasterHandler: Router.RouteHandler | undefined;

    for (const polymorphicArrayElement of routesAndHandlersData) {

      if ("handler" in polymorphicArrayElement) {

        if (polymorphicArrayElement.pathTemplate.endsWith("/*")) {

          mappedWildcardRoutes.set(
            removeDanglingSlashes(polymorphicArrayElement.pathTemplate, { leading: true, trailing: false }).replace(/\/\*$/u, ""),
            polymorphicArrayElement
          );

        } else {

          mappedRoutesAndHandlers.set(polymorphicArrayElement, polymorphicArrayElement.handler);

        }

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

        for (const [ route, handler ] of controller.getRoutesAndHandlers()) {

          /* eslint-disable-next-line max-depth --
           * Currently, the code is not so complicated to extract this iteration to another method. */
          if (route.pathTemplate.endsWith("/*")) {

            mappedWildcardRoutes.set(
              removeDanglingSlashes(route.pathTemplate.replace(/\/\*$/u, ""), { leading: true, trailing: false }),
              { ...route, handler }
            );

          } else {

            mappedRoutesAndHandlers.set(
              {
                ...isNotUndefined(controller.URI_QueryParametersDeserializer) ?
                    { URI_QueryParametersDeserializer: controller.URI_QueryParametersDeserializer } : null,
                ...route
              },
              handler.bind(controller)
            );

          }

        }

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

    for (const [ route, handler ] of mappedRoutesAndHandlers.entries()) {

      const normalizedRoutesOfCurrentHTTP_Method: Router.NormalizedRouting.RoutesOfSpecificHTTP_Method =
          normalizedRouting[route.HTTP_Method];

      Router.addRouteAndHandlerPairToNormalizedRoutesOfSpecificHTTP_MethodMutableObject({
        normalizedRoutesOfTargetHTTP_Method: normalizedRoutesOfCurrentHTTP_Method,
        route,
        handler,
        mappedWildcardRoutesOfTargetHTTP_Method:
            filterMap(
              mappedWildcardRoutes,
              (_pathTemplateAsKey: string, routeAndHandler: Router.RouteAndHandler): boolean =>
                  routeAndHandler.HTTP_Method === route.HTTP_Method
            )
      });

    }

    return normalizedRouting;

  }

  public static getRouteMatch(
    {
      URI_Path,
      HTTP_Method,
      normalizedRouting
    }: {
      URI_Path: string;
      HTTP_Method: HTTP_Methods;
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
  protected static addRouteAndHandlerPairToNormalizedRoutesOfSpecificHTTP_MethodMutableObject(
    {
      normalizedRoutesOfTargetHTTP_Method,
      route,
      handler,
      mappedWildcardRoutesOfTargetHTTP_Method
    }: {
      normalizedRoutesOfTargetHTTP_Method: Router.NormalizedRouting.RoutesOfSpecificHTTP_Method;
      route: Router.Route;
      handler: Router.RouteHandler;
      mappedWildcardRoutesOfTargetHTTP_Method: Map<string, Router.RouteAndHandler>;
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

    for (const [ index ] of pathSegments.entries()) {

      const isLastSegment: boolean = index === pathSegments.length - 1;

      const interimRoute: string = pathSegments.slice(0, index + 1).join("/");

      wildcardRouteWithHandler =
          Router.getBestWildcardRoute(mappedWildcardRoutesOfTargetHTTP_Method, interimRoute) ??
          wildcardRouteWithHandler;

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


      const pathSegmentAtNextPosition: string = pathSegments[index + 1];

      if (Router.isSegmentIsRouteParameter(pathSegmentAtNextPosition)) {

        if (isUndefined(normalizedRoutingDataForSpecificPathSegment.routingForRoutePathParameterAtNextPosition)) {

          normalizedRoutingDataForSpecificPathSegment.routingForRoutePathParameterAtNextPosition = {
            parameterName: removeSpecificCharacterFromCertainPosition({
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

  private static isSegmentIsRouteParameter(targetURL_Segment: string): boolean {
    return targetURL_Segment.startsWith(":");
  }

  private static getBestWildcardRoute(
    mappedWildcardRoutes: Map<string, Router.RouteAndHandler>,
    currentPath: string
  ): Router.RouteAndHandler | undefined {
    return Array.from(mappedWildcardRoutes.entries()).
        filter(([ partialPath ]: Readonly<[ string, Router.RouteAndHandler ]>): boolean => currentPath.startsWith(partialPath)).
        toSorted(
          (
            [ onePath ]: Readonly<[ string, Router.RouteAndHandler ]>,
            [ otherPath ]: Readonly<[ string, Router.RouteAndHandler ]>
          ): number =>
              onePath.length - otherPath.length
        ).
        toReversed()[0]?.[1];
  }

}


namespace Router {

  export type RawRouting = ReadonlyArray<ControllerInheritingClass | RouteAndHandler | NotFoundHandlerDefinition>;

  export type Route = Readonly<{
    HTTP_Method: HTTP_Methods;
    pathTemplate: string;
    URI_QueryParametersDeserializer?: URI_QueryParametersDeserializer;
  }>;

  export namespace Route {
    export const ANY_HTTP_METHOD: string = "ANY_HTTP_METHOD";
  }

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
      routingForStaticPathSegmentsAtNextPosition?: RoutingForStaticPathSegmentsAtNextPosition;
      routingForRoutePathParameterAtNextPosition?: RoutingForRouteParameterAtNextPosition;
      wildcardRouteForPathAtLeastOfCurrentLength?: RouteForPathOfSpecificDepth;
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
