import {
  Controller,
  Request,
  Response,
  HTTP_Methods
} from "@yamato-daiwa/backend";
import {
  convertPotentialStringToIntegerIfPossible,
  RawObjectDataProcessor
} from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products"
  })
  public async generateProductsPage(_request: Request, response: Response): Promise<void> {
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
