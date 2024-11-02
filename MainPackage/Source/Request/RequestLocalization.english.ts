import type Request from "./Request";
import { ImproperUsageError } from "@yamato-daiwa/es-extensions";


const requestLocalization__english: Request.Localization = {

  errors: {

    unableToAccessToProcessedRoutePathParameters: {
      title: ImproperUsageError.localization.defaultTitle,
      description:
          "`request.validateAndProcessRoutePathParameters` could be called if and only if the specific route has been " +
            "matched for target request."
    },

    unableToAccessToProcessedURI_QueryParameters: {
      title: ImproperUsageError.localization.defaultTitle,
      description:
          "`request.validateAndProcessURI_QueryParameters` could be called if and only if the specific route has been " +
            "matched for target request."
    }

  },

  titles: {
    routePath: {
      generate: (
        { stringifiedRoute }: Request.Localization.Titles.RoutePath.DataName.TemplateVariables
      ): string =>
          `Path Parameters of "${ stringifiedRoute }" route`
    },
    URI_Query: {
      generate: (
        { stringifiedRoute }: Request.Localization.Titles.RoutePath.DataName.TemplateVariables
      ): string =>
          `URI Query Parameters of "${ stringifiedRoute }" route`
    }
  }

};


export default requestLocalization__english;
