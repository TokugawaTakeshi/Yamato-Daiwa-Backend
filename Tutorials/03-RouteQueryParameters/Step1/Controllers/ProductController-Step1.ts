import {
  Controller,
  Request,
  Response,
  HTTP_Methods
} from "@yamato-daiwa/backend";
import {
  RawObjectDataProcessor,
  convertPotentialStringToIntegerIfPossible,
  convertPotentialStringToNumberIfPossible
} from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products"
  })
  public async generateProductsPage(request: Request, response: Response): Promise<void> {

    const {
      fullOrPartialProductTitle,
      paginationPageNumber,
      itemsCountPerPaginationPage,
    }: Readonly<{
      fullOrPartialProductTitle: string;
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
    }> = request.validateAndProcessURI_QueryParameters({
      fullOrPartialProductTitle: {
        type: String,
        isUndefinedForbidden: false,
        isNullForbidden: true,
        minimalCharactersCount: 2
      },
      paginationPageNumber: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        isUndefinedForbidden: true,
        isNullForbidden: true,
        isNaN_Forbidden: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
      },
      itemsCountPerPaginationPage: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        isUndefinedForbidden: true,
        isNullForbidden: true,
        isNaN_Forbidden: true,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumber
      }
    });

    console.table({
      fullOrPartialProductTitle,
      paginationPageNumber,
      itemsCountPerPaginationPage
    });

    return response.submitWithSuccess({
      HTML_Content: "<h1>Products list</h1>"
    });

  }

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products/:PRODUCT_ID"
  })
  public async generateProductProfilePage(request: Request, response: Response): Promise<void> {

    const targetProductID: number = request.validateAndProcessRoutePathParameters<{ PRODUCT_ID: number; }>({
      PRODUCT_ID: {
        preValidationModifications: convertPotentialStringToIntegerIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumberOrZero,
        isNaN_Forbidden: true,
        isUndefinedForbidden: true,
        isNullForbidden: true
      }
    }).PRODUCT_ID;

    return response.submitWithSuccess({
      HTML_Content: `<h1>Product with ID: ${ targetProductID }</h1>`
    });

  }

}
