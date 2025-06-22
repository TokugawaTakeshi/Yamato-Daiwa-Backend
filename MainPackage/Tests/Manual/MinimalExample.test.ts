import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
import type { Request, Response } from "../../Source";
import { Server } from "../../Source";


/* [ Execution ] tsx Tests/Manual/MinimalExample.test.ts */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: [
    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>MinimalExample</h1>"
        });
      }
    }
  ]
});
