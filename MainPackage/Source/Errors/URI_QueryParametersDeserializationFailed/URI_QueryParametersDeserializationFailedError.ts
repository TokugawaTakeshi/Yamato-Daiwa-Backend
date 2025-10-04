import URI_QueryParametersDeserializationFailedErrorLocalization__english from
      "./URI_QueryParametersDeserializationFailedError.english";
import { stringifyAndFormatArbitraryValue } from "@yamato-daiwa/es-extensions";


class URI_QueryParametersDeserializationFailedError extends Error {

  public static readonly NAME: string = "URI_QueryParametersDeserializationFailed";

  public static localization: URI_QueryParametersDeserializationFailedError.Localization =
      URI_QueryParametersDeserializationFailedErrorLocalization__english;


  public constructor(compoundParameter: URI_QueryParametersDeserializationFailedError.ConstructorParameter) {

    super();

    this.name = URI_QueryParametersDeserializationFailedError.NAME;

    this.message = URI_QueryParametersDeserializationFailedError.localization.generateDescription({
      route: compoundParameter.route,
      stringifiedCauseError: stringifyAndFormatArbitraryValue(compoundParameter.causeError)
    });

  }

}


namespace URI_QueryParametersDeserializationFailedError {

  export type ConstructorParameter = Readonly<{
    route?: string;
    causeError: unknown;
  }>;

  export type Localization = Readonly<{
    defaultTitle: string;
    generateDescription: (templateVariables: Localization.Description.TemplateVariables) => string;
  }>;

  export namespace Localization {
    export namespace Description {
      export type TemplateVariables = Readonly<{
        route?: string;
        stringifiedCauseError: string;
      }>;
    }
  }

}


export default URI_QueryParametersDeserializationFailedError;
