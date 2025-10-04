import * as YDB from "@yamato-daiwa/backend";


YDB.Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: YDB.ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      HTTP_Method: YDB.HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithSuccess({ HTML_Content: "<h1>Hello, world!</h1>" });
      }
    }
  ]
});
