import ProductController from "./Controllers/ProductController-Step1";
import {
  Server,
  Request,
  Response,
  ProtocolDependentDefaultPorts,
  HTTP_Methods
} from "@yamato-daiwa/backend";


/* Running the test:
 *  tsx Step1/EntryPoint-Step1.ts
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

    ProductController

  ]
});
