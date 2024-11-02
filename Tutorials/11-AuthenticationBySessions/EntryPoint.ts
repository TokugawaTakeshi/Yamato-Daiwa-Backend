import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
import SessionManagerMiddleware from "./SessionManagerMiddleware";


/* Running the test:
*  ts-node EntryPoint.ts
* */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({ HTML_Content: "<h1>Hello, world!</h1>" });
      }
    }
  ],
  middlewares: [
    new SessionManagerMiddleware()
  ]
});
