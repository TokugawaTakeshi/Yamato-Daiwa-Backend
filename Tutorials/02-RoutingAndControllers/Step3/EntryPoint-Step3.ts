import {
  Server,
  Request,
  Response,
  ProtocolDependentDefaultPorts,
  HTTP_Methods
} from "@yamato-daiwa/backend";
import {
  convertPotentialStringToNumberIfPossible,
  RawObjectDataProcessor
} from "@yamato-daiwa/es-extensions";


/* Running the test:
 *  ts-node Step3/EntryPoint-Step3.ts
 * */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [

     {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top Page</h1>"
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/products",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Products</h1>"
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "products/:PRODUCT_ID",
      async handler(request: Request, response: Response): Promise<void> {

        const targetProductID: number = request.validateAndProcessRoutePathParameters<{ PRODUCT_ID: number; }>({
          PRODUCT_ID: {
            preValidationModifications: convertPotentialStringToNumberIfPossible,
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
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/checkout",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Checkout</h1>"
        });
      }
    }

  ]
});
