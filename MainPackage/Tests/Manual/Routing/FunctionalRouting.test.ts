import { ClientErrorsHTTP_StatusCodes } from "@yamato-daiwa/es-extensions";
import * as YDB from "../../../Source";


YDB.Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: [

    /* ━━━ Plausible Cases ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
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
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/api/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Not appropriate API at all." }
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/api/products/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Unknown API for products." }
        });
      }
    },


    /* ━━━ Optimized for Testing Cases ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/foo/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Not such api for subpath of \"/foo\"." }
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/foo/bar/baz/hoge/fuga/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Not such api for subpath of \"/foo/bar/baz/hoge/fuga/*\"." }
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/foo/bar/baz/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Not such api for subpath of \"/foo/bar/baz/*\"." }
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/foo/bar/piyo/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Not such api for subpath of \"/foo/bar/piyo/*\"." }
        });
      }
    },

    {
      HTTP_Method: YDB.HTTP_Methods.all,
      pathTemplate: "/foo/bar/baz/spam/ham/*",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithError({
          statusCode: ClientErrorsHTTP_StatusCodes.notFound,
          JSON_Content: { message: "Not such api for subpath of \"/foo/bar/baz/spam/ham/*\"." }
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
