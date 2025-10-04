import { ClientErrorsHTTP_StatusCodes, HTTP_Methods } from "@yamato-daiwa/es-extensions";
import * as YDB from "../../../Source";


YDB.Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: [

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top Page</h1>"
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/products",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Products</h1>"
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/api/products",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithSuccess({
          JSON_Content: {
            products: []
          }
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/api/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Nor appropriate API at all." }
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/api/products/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Nor appropriate API for products." }
        });
      }
    },

    {
      notFound:
        async (_request: YDB.Request, response: YDB.Response): Promise<void> =>
            response.submitWithSuccess({ HTML_Content: "<h1>Not Found</h1>" })
    }

  ]
});
