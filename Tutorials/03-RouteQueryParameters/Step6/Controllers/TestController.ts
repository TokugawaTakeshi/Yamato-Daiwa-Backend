import {
  Controller,
  Request,
  Response,
  HTTP_Methods,
  URI_QueryParametersDeserializer
} from "@yamato-daiwa/backend";
import {
  convertPotentialStringToNumberIfPossible,
  ParsedJSON_Object,
  RawObjectDataProcessor
} from "@yamato-daiwa/es-extensions";
import QueryString from "qs";


export default class TestController extends Controller {

  public URI_QueryParametersDeserializer: URI_QueryParametersDeserializer =

      (rawQueryParametersWithoutLeadingQuestionMark: string): ParsedJSON_Object =>

          QueryString.parse(
            rawQueryParametersWithoutLeadingQuestionMark,
            { allowDots: true }
          );


  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "users"
  })
  public async route1(request: Request, response: Response): Promise<void> {

    const {
      user,
      settings
    }: Readonly<{
      user: Readonly<{
        name: string;
        age: 30;
      }>;
      settings: Readonly<{
        theme: string;
      }>;
    }> = request.validateAndProcessURI_QueryParameters({

      user: {

        type: Object,
        isUndefinedForbidden: true,
        isNullForbidden: true,

        properties: {

          name: {
            type: String,
            isUndefinedForbidden: true,
            isNullForbidden: true,
            minimalCharactersCount: 1
          },

          age: {
            preValidationModifications: convertPotentialStringToNumberIfPossible,
            type: Number,
            isUndefinedForbidden: true,
            isNullForbidden: true,
            isNaN_Forbidden: true,
            numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumberOrZero
          }

        }

      },

       settings: {

        type: Object,
        isUndefinedForbidden: true,
        isNullForbidden: true,

        properties: {

          theme: {
            type: String,
            isUndefinedForbidden: true,
            isNullForbidden: true,
            minimalCharactersCount: 1
          }

        }

      }

    });

    console.table({
      user,
      settings
    });

    return response.submitWithSuccess({
      JSON_Content: { user, settings }
    });

  }

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "settings",
    URI_QueryParametersDeserializer:
        (rawQueryParametersWithoutLeadingQuestionMark: string): ParsedJSON_Object =>
            QueryString.parse(
              rawQueryParametersWithoutLeadingQuestionMark,
              { comma: true }
            )
  })
  public async route2(request: Request, response: Response): Promise<void> {

    const {
      colors,
      flags
    }: Readonly<{
      colors: ReadonlyArray<string>;
      flags: ReadonlyArray<string>;
    }> = request.validateAndProcessURI_QueryParameters({

      colors: {

        type: Array,
        undefinedValueSubstitution: [],
        isNullForbidden: true,
        areUndefinedElementsForbidden: true,
        areNullElementsForbidden: true,

        element: {
          type: String,
          minimalCharactersCount: 1
        }

      },

      flags: {

        type: Array,
        undefinedValueSubstitution: [],
        isNullForbidden: true,
        areUndefinedElementsForbidden: true,
        areNullElementsForbidden: true,

        element: {
          type: String,
          minimalCharactersCount: 1
        }

      }

    });

    console.table({
      colors,
      flags
    });

    return response.submitWithSuccess({
      JSON_Content: { colors: [ ...colors ], flags: [ ...flags ] }
    });

  }

}
