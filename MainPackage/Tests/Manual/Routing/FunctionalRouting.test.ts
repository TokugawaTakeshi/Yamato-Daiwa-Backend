import { ClientErrorsHTTP_StatusCodes } from "@yamato-daiwa/es-extensions";
import * as YDB from "../../../Source";


YDB.Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: [

    // {
    //   HTTP_Method: HTTP_Methods.get,
    //   pathTemplate: "/",
    //   async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
    //     return response.submitWithSuccess({
    //       HTML_Content: "<h1>Top Page</h1>"
    //     });
    //   }
    // },
    //
    // {
    //   HTTP_Method: HTTP_Methods.get,
    //   pathTemplate: "/products",
    //   async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
    //     return response.submitWithSuccess({
    //       HTML_Content: "<h1>Products</h1>"
    //     });
    //   }
    // },
    //
    // {
    //   HTTP_Method: YDB.HTTP_Methods.all,
    //   pathTemplate: "/api/products",
    //   async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
    //     return response.submitWithSuccess({
    //       JSON_Content: {
    //         products: []
    //       }
    //     });
    //   }
    // },
    //
    // {
    //   HTTP_Method: YDB.HTTP_Methods.all,
    //   pathTemplate: "/api/*",
    //   async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
    //     return response.submitWithError({
    //       statusCode: ClientErrorsHTTP_StatusCodes.notFound,
    //       JSON_Content: { message: "Nor appropriate API at all." }
    //     });
    //   }
    // },

    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/foo/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Nor appropriate API." }
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/foo/bar/baz/hoge/fuga/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Nor appropriate API." }
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/foo/bar/baz/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Nor appropriate API." }
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
