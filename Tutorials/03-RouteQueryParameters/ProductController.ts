import {
  Request,
  Response,
  Controller,
  BooleanParameterDefaultPreValidationModifier
} from "@yamato-daiwa/backend";

import {
  HTTP_Methods,
  RawObjectDataProcessor,
  convertPotentialStringToNumberIfPossible
} from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  private static readonly productsRetrievingQueryParameters: RawObjectDataProcessor.PropertiesSpecification = {
    paginationPageNumber: {
      preValidationModifications: convertPotentialStringToNumberIfPossible,
      type: Number,
      required: true,
      numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
    },
    itemsCountPerPaginationPage: {
      preValidationModifications: convertPotentialStringToNumberIfPossible,
      type: Number,
      required: true,
      numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
    },
    forcedFiltering: {
      type: Object,
      required: false,
      properties: {
        makerID: {
          preValidationModifications: convertPotentialStringToNumberIfPossible,
          type: Number,
          required: true,
          numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
        }
      }
    },
    consciousFiltering: {
      type: Object,
      required: false,
      properties: {
        fullOrPartialProductName: {
          type: String,
          required: false,
          minimalCharactersCount: 2
        },
        outOfStock: {
          preValidationModifications: BooleanParameterDefaultPreValidationModifier,
          type: Boolean,
          required: false
        },
        categoriesIDs: {
          type: Array,
          required: false,
          element: {
            preValidationModifications: convertPotentialStringToNumberIfPossible,
            type: Number,
            numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
          }
        }
      }
    }
  };

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products"
  })
  public async retrieveProductsSelection(request: Request, response: Response): Promise<void> {

    const {
      paginationPageNumber,
      itemsCountPerPaginationPage,
      forcedFiltering,
      consciousFiltering
    }: Readonly<{
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      forcedFiltering?: {
        makerID: number;
      };
      consciousFiltering?: {
        fullOrPartialProductName?: string;
        outOfStock?: boolean;
        categoriesIDs?: Array<number>;
      }
    }> = request.validateAndProcessURI_QueryParameters(
      ProductController.productsRetrievingQueryParameters
    );

    console.log(request.URI);
    console.log(paginationPageNumber);
    console.log(itemsCountPerPaginationPage);
    console.log(forcedFiltering);
    console.log(consciousFiltering);

    return response.submitWithSuccess({
      JSON_Content: []
    });

  }

}
