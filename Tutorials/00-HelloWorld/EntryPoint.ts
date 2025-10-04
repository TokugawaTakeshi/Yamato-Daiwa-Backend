import {
  Server,
  Request,
  Response,
  ProtocolDependentDefaultPorts,
  HTTP_Methods
} from "@yamato-daiwa/backend";


/* Running the test:
*  tsx EntryPoint.ts   OR   npm run start
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
  ]
});
