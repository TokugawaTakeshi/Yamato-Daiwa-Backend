import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
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
          HTML_Content: "<h1>Minimal Example</h1>"
        });
      }
    }
  ]
});
