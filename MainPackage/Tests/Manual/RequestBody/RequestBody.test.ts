import { HTTP_Methods, Logger } from "@yamato-daiwa/es-extensions";
import * as YDB from "../../../Source";


YDB.Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: [

    {
      HTTP_Method: HTTP_Methods.post,
      pathTemplate: "/",
      async handler(request: YDB.Request, response: YDB.Response): Promise<void> {

        const result: unknown = await request.parseAndValidateJSON_Body({});

        Logger.logInfo({
          title: "Parsed JSON body",
          description: "",
          additionalData: {
            result
          }
        });

        return response.submitWithSuccess({
          HTML_Content: "<h1>Top Page</h1>"
        });

      }
    }

  ]
});
