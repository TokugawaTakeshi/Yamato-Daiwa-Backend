import type URI_QueryParametersDeserializationFailedError from "./URI_QueryParametersDeserializationFailedError";
import { isNonEmptyString } from "@yamato-daiwa/es-extensions";


export const URI_QueryParametersDeserializationFailedErrorLocalization__english:
  URI_QueryParametersDeserializationFailedError.Localization =
      {
        defaultTitle: "URI Query Parameters Deserialization Failed",
        generateDescription:
            (
              {
                route,
                stringifiedCauseError
              }: URI_QueryParametersDeserializationFailedError.Localization.Description.TemplateVariables
            ): string => [
              "For following error has caused the failure of URI query parameters deserialization",
              ...isNonEmptyString(route) ? [ ` for the route "${ route }"` ] : [],
              `.\n${ stringifiedCauseError }`
            ].join("")
      };


export default URI_QueryParametersDeserializationFailedErrorLocalization__english;
