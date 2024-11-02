import HostHTTP_HeaderParser from "../../Source/Utils/HostHTTP_HeaderParser";
import { test } from "node:test";
import { strictEqual } from "assert";
import { Logger } from "@yamato-daiwa/es-extensions";


const sample: string = "example.com:3000";
const parsedHTTP_HostHeader: HostHTTP_HeaderParser.ParsedHostHTTP_Header = HostHTTP_HeaderParser.parse(sample, {
  defaultPortForActualProtocol: 3000,
  supportedBasicDomains: [ "example.com" ]
});

test(
  "Default Post has been substituted Correctly",
  (): void => {
    strictEqual(parsedHTTP_HostHeader.port, 3000);
  }
).
    catch(
      (error: unknown): void => {
        Logger.logError({
          errorType: "TestsRunningError",
          title: "Tests Crashed",
          description: "The unexpected error has occurred during test running",
          occurrenceLocation: "Tests/Automated/HostHTTP_HeaderParser.test.ts",
          caughtError: error
        });
      }
    );
