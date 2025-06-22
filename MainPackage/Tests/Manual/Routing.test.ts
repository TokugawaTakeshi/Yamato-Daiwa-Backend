import { ClientErrorsHTTP_StatusCodes, HTTP_Methods } from "@yamato-daiwa/es-extensions";
import type { Request, Response } from "../../Source";
import { Server } from "../../Source";


/* [ Execution ] tsx Tests/Manual/Routing.test.ts */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: 1337 },
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
      pathTemplate: "/*",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Not Found</h1>"
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/api/products",
      async handler(_request: Request, response: Response): Promise<void> {
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
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: {}
        });
      }
    }

  ]
});
