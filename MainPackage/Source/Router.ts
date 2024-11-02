/* ─── Framework ──────────────────────────────────────────────────────────────────────────────────────────────────── */
import type Request from "./Request/Request";
import type Response from "./Response/Response";
import type Controller from "./Controller/Controller";
import type { ControllerInheritingClass } from "./Controller/Controller";
import type URI_QueryParametersDeserializer from "./URI_QueryParametersDeserializer";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  HTTP_Methods,
  isUndefined,
  isNotUndefined,
  removeSpecificCharacterFromCertainPosition
} from "@yamato-daiwa/es-extensions";
import removeSlashes from "./UtilsIncubator/removeSlashes";


abstract class Router {

  /* ━━━ Public Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  public static normalizeRouting(routesAndHandlersData: Router.RawRouting): Router.NormalizedRouting {

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
      [HTTP_Methods.patch]: {}
    };

    const mappedRoutesAndHandlers: Map<Router.Route, Router.RouteHandler> = new Map<Router.Route, Router.RouteHandler>();

    for (const variadicArrayElement of routesAndHandlersData) {

      if ("handler" in variadicArrayElement) {

        mappedRoutesAndHandlers.set(variadicArrayElement, variadicArrayElement.handler);

      } else {

        const SpecificControllerClass: new () => Controller = variadicArrayElement;
        const controller: Controller = new SpecificControllerClass();

        for (const [ route, handler ] of controller.getRoutesAndHandlers()) {
          mappedRoutesAndHandlers.set(route, handler.bind(controller));
        }

      }

    }


    for (const [ route, handler ] of mappedRoutesAndHandlers.entries()) {

      const normalizedRoutesOfCurrentHTTP_Method: Router.NormalizedRouting.RoutesOfSpecificHTTP_Method =
          normalizedRouting[route.HTTP_Method];

      Router.addRouteAndHandlerPairToNormalizedRoutesOfSpecificHTTP_MethodMutableObject({
        normalizedRoutesOfTargetHTTP_Method: normalizedRoutesOfCurrentHTTP_Method,
        route,
        handler
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
    const URI_PathSegments: Array<string> = removeSlashes(URI_Path, { leading: true, trailing: true }).split("/");
    const routePathParameters: Router.RoutePathParameters = {};

    if (URI_PathSegments.length === 1 && URI_PathSegments[0].length === 0) {

      const routeForRootPath: Router.NormalizedRouting.RouteForPathOfSpecificDepth | undefined =
          matchesActualForCurrentHTTP_Method["/"]?.routeForPathOfCurrentLength;

      return isNotUndefined(routeForRootPath) ?
          {
            handler: routeForRootPath.handler,
            routePathParameters,
            routePathTemplate: "/"
          } : null;

    }


    let matchesForCurrentPathSegmentsCount: Router.NormalizedRouting.RoutingDataForSpecificPathSegment | undefined =
        matchesActualForCurrentHTTP_Method[URI_PathSegments[0]];

    for (const [ index ] of URI_PathSegments.entries()) {

      if (isUndefined(matchesForCurrentPathSegmentsCount)) {
        return null;
      }


      const isLastSegment: boolean = index === URI_PathSegments.length - 1;

      if (isLastSegment) {

        if (isUndefined(matchesForCurrentPathSegmentsCount.routeForPathOfCurrentLength)) {
          return null;
        }


        return {
          handler: matchesForCurrentPathSegmentsCount.routeForPathOfCurrentLength.handler,
          routePathTemplate: matchesForCurrentPathSegmentsCount.routeForPathOfCurrentLength.pathTemplate,
          routePathParameters
        };

      }


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
      }

    }

    return null;

  }


  /* ━━━ Protected Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  protected static addRouteAndHandlerPairToNormalizedRoutesOfSpecificHTTP_MethodMutableObject(
      {
        normalizedRoutesOfTargetHTTP_Method,
        route,
        handler
      }: {
        normalizedRoutesOfTargetHTTP_Method: Router.NormalizedRouting.RoutesOfSpecificHTTP_Method;
        route: Router.Route;
        handler: Router.RouteHandler;
      }
  ): void {

    if (route.pathTemplate === "/") {
      normalizedRoutesOfTargetHTTP_Method["/"] = { routeForPathOfCurrentLength: { handler, pathTemplate: "/" } };
      return;
    }


    const pathSegments: ReadonlyArray<string> = removeSlashes(
        route.pathTemplate, { leading: true, trailing: true }
    ).split("/");

    let normalizedRoutingDataForSpecificPathSegment: Router.NormalizedRouting.RoutingDataForSpecificPathSegment;
    const normalizedRoutingDataForFirstPathSegment: Router.NormalizedRouting.RoutingDataForSpecificPathSegment | undefined =
        normalizedRoutesOfTargetHTTP_Method[pathSegments[0]];

    if (isNotUndefined(normalizedRoutingDataForFirstPathSegment)) {
      normalizedRoutingDataForSpecificPathSegment = normalizedRoutingDataForFirstPathSegment;
    } else {
      normalizedRoutingDataForSpecificPathSegment = {};
      normalizedRoutesOfTargetHTTP_Method[pathSegments[0]] = normalizedRoutingDataForSpecificPathSegment;
    }

    for (const [ index ] of pathSegments.entries()) {

      const isLastSegment: boolean = index === pathSegments.length - 1;

      if (isLastSegment) {

        normalizedRoutingDataForSpecificPathSegment.routeForPathOfCurrentLength = {
          handler, pathTemplate: route.pathTemplate
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

}


namespace Router {

  export type RawRouting = ReadonlyArray<ControllerInheritingClass | RouteAndHandler>;

  export type Route = Readonly<{
    HTTP_Method: HTTP_Methods;
    pathTemplate: string;
    queryParametersDeserializer?: URI_QueryParametersDeserializer;
  }>;

  export type RouteHandler = (request: Request, response: Response) => Promise<void>;

  /* [ API ] For the user's convenience, it is better to refrain from namespacing of "RouteAndHandlerPair". */
  export type RouteAndHandler = Route & Readonly<{ handler: RouteHandler; }>;

  export type RouteMatch = Readonly<{
    handler: RouteHandler;
    routePathTemplate: string;
    routePathParameters: RoutePathParameters;
  }>;

  export type RoutePathParameters = { [pathSegment: string]: string | undefined; };


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
  }>;

  export namespace NormalizedRouting {

    export type RoutesOfSpecificHTTP_Method = {
      [pathSegment: string]: RoutingDataForSpecificPathSegment | undefined;
    };

    export type RoutingDataForSpecificPathSegment = {
      routeForPathOfCurrentLength?: RouteForPathOfSpecificDepth;
      routingForStaticPathSegmentsAtNextPosition?: RoutingForStaticPathSegmentsAtNextPosition;
      routingForRoutePathParameterAtNextPosition?: RoutingForRouteParameterAtNextPosition;
    };

    export type RouteForPathOfSpecificDepth = {
      pathTemplate: string;
      handler: RouteHandler;
    };

    export type RoutingForStaticPathSegmentsAtNextPosition = {
      [routePathSegment: string]: RoutingDataForSpecificPathSegment | undefined;
    };
    export type RoutingForRouteParameterAtNextPosition = RoutingDataForSpecificPathSegment & Readonly<{ parameterName: string; }>;
  }

}


export default Router;
