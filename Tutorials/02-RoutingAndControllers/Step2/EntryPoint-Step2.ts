import * as YDB from "@yamato-daiwa/backend";


YDB.Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: YDB.ProtocolDependentDefaultPorts.HTTP },
  routing: [

    {
      HTTP_Method: YDB.HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top Page</h1>"
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.get,
      pathTemplate: "/products",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Products</h1>"
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.get,
      pathTemplate: "products/:PRODUCT_ID",
      async handler(request: YDB.Request, response: YDB.Response): Promise<void> {

        const targetProductID: string = request.validateAndProcessRoutePathParameters<{ PRODUCT_ID: string; }>({
          PRODUCT_ID: {
            type: String,
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
      HTTP_Method: YDB.HTTP_Methods.get,
      pathTemplate: "/checkout",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Checkout</h1>"
        });
      }
    }

  ]
});
