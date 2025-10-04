/* ─── Configuration ──────────────────────────────────────────────────────────────────────────────────────────────── */
import type ConfigurationFromDotEnvFile from "./ConfigurationFromDotEnvFile";
import ConfigurationRepresentative from "./ConfigurationRepresentative";

/* ─── Framework ─────────────────────────────────────────────────────────────────────────────────────────────────── */
import { Server, Request, Response } from "@yamato-daiwa/backend";

/* ─── Utils ─────────────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  HTTP_Methods,
  RawObjectDataProcessor,
  convertPotentialStringToNumberIfPossible
} from "@yamato-daiwa/es-extensions";
import { ObjectDataFilesProcessor } from "@yamato-daiwa/es-extensions-nodejs";


const configFromDotEnvFile: ConfigurationFromDotEnvFile = ObjectDataFilesProcessor.processFile({
  filePath: ".env",
  validDataSpecification: {
    nameForLogging: "ConfigurationFromDotenv",
    subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
    properties: {
      IP_ADDRESS: {
        type: String,
        required: false
      },
      HTTP_PORT: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        required: false
      }
    }
  },
  synchronously: true
});


ConfigurationRepresentative.initialize(configFromDotEnvFile);


/* Running the test:
*  ts-node EntryPoint.ts
* */
Server.initializeAndStart({
  IP_Address: ConfigurationRepresentative.IP_Address,
  HTTP: { port: ConfigurationRepresentative.HTTP_Port },
  routing: [
    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    }
  ]
});
