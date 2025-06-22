import type Server from "../Server/Server";
import type Cookie from "../Cookie";

import type HTTP from "http";
import FileSystem from "fs";

import {
  Logger,
  UnexpectedEventError,
  SuccessfulResponsesHTTP_StatusCodes,
  isNotUndefined,
  isNonEmptyString
} from "@yamato-daiwa/es-extensions";
import type {
  ParsedJSON,
  ClientErrorsHTTP_StatusCodes,
  ServerErrorsHTTP_StatusCodes
} from "@yamato-daiwa/es-extensions";

import { ResponseLocalizer } from "./ResponseLocalization";


class Response {

  public readonly cookies: Map<Cookie.Name, Cookie> = new Map();

  private readonly nativeResponse: HTTP.ServerResponse;


  public constructor(rawResponse: HTTP.ServerResponse, configuration: Server.NormalizedConfiguration) {

    this.nativeResponse = rawResponse;

    this.nativeResponse.
        setHeader("Cross-Origin-Opener-Policy", configuration.security.HTTP_Headers.crossOriginOpenerPolicy).
        setHeader("Cross-Origin-Resource-Policy", configuration.security.HTTP_Headers.crossOriginResourcePolicy);

    if (configuration.security.HTTP_Headers.originAgentCluster) {
      this.nativeResponse.setHeader("Origin-Agent-Cluster", "?1");
    }

  }


  public async submitWithSuccess(payload: Response.SuccessfulSubmittingPayload): Promise<void> {

    this.nativeResponse.statusCode = payload.statusCode ?? SuccessfulResponsesHTTP_StatusCodes.OK;

    let responseBody: string | undefined;

    if ("HTML_Content" in payload) {
      responseBody = payload.HTML_Content;
      this.nativeResponse.setHeader("Content-Type", "text/html");
    } else if ("JSON_Content" in payload) {
      responseBody = JSON.stringify(payload.JSON_Content);
      this.nativeResponse.setHeader("Content-Type", "application/json");
    } else if ("plainTextContent" in payload) {
      responseBody = payload.plainTextContent;
      this.nativeResponse.setHeader("Content-Type", "text/plain");
    } else if ("filePath" in payload) {
      return this.sendFileByStreamAPI(payload.filePath);
    }

    if (payload.noCache === true) {
      this.nativeResponse.setHeader("Cache-control", "no-cache");
    }

    this.onBeforeSubmit();

    if (isNotUndefined(responseBody)) {
      this.nativeResponse.write(responseBody);
    }

    return new Promise<void>((resolve: () => void): void => {
      this.nativeResponse.end(resolve);
    });

  }

  public async submitWithError(payload: Response.ErroredSubmittingPayload): Promise<void> {

    this.nativeResponse.statusCode = payload.statusCode;

    if (isNotUndefined(payload.errorMessage)) {
      this.nativeResponse.statusMessage = payload.errorMessage;
    }


    let responseBody: string | undefined;

    /* [ Theory ]
     * Do not use `nativeResponse.write()` here because this method starts to submitting the response body what makes
     *   unable to set the HTTP headers while they must be able to change for now. */
    if (isNotUndefined(payload.HTML_Content)) {
      responseBody = payload.HTML_Content;
      this.nativeResponse.setHeader("Content-Type", "text/html");
    } else if (isNotUndefined(payload.JSON_Content)) {
      responseBody = JSON.stringify(payload.JSON_Content);
      this.nativeResponse.setHeader("Content-Type", "application/json");
    } else if (isNotUndefined(payload.plainTextContent)) {
      responseBody = payload.plainTextContent;
      this.nativeResponse.setHeader("Content-Type", "text/plain");
    }

    this.onBeforeSubmit();

    if (isNotUndefined(responseBody)) {
      this.nativeResponse.write(responseBody);
    }

    return new Promise<void>((resolve: () => void): void => {
      this.nativeResponse.end(resolve);
    });
  }

  public setHeaders(headers: { [headerName: string]: string | ReadonlyArray<string>; }): void {
    for (const [ key, value ] of Object.entries(headers)) {
      this.nativeResponse.setHeader(key, value);
    }
  }


  private onBeforeSubmit(): void {

    const currentSetCookieHTTP_HeaderRawValue: Array<string> | string | undefined =
        this.nativeResponse.getHeaders()["set-cookie"];

    let finalSetCookieHTTP_Header: Array<string>;

    if (Array.isArray(currentSetCookieHTTP_HeaderRawValue)) {
      finalSetCookieHTTP_Header = [ ...currentSetCookieHTTP_HeaderRawValue ];
    } else if (isNonEmptyString(currentSetCookieHTTP_HeaderRawValue)) {
      finalSetCookieHTTP_Header = [ currentSetCookieHTTP_HeaderRawValue ];
    } else {
      finalSetCookieHTTP_Header = [];
    }

    finalSetCookieHTTP_Header.push(
      ...Array.from(this.cookies.values()).map(
        (cookie: Cookie): string => cookie.serialize()
      )
    );

    this.nativeResponse.setHeader("Set-Cookie", finalSetCookieHTTP_Header);

  }

  private async sendFileByStreamAPI(targetFilePath: string): Promise<void> {
    return new Promise<void>((resolve: () => void, reject: (error: Error) => void): void => {

      const fileReadingStream: FileSystem.ReadStream = FileSystem.createReadStream(targetFilePath);

      fileReadingStream.pipe(this.nativeResponse);

      fileReadingStream.on("error", (fileReadingError: Error): void => {

        Logger.logError({
          errorType: UnexpectedEventError.NAME,
          ...ResponseLocalizer.localization.generateFileSubmittingFailureErrorLog({ targetFilePath }),
          occurrenceLocation: "response.sendFileByStreamAPI(targetFilePath)",
          caughtError: fileReadingError
        });

        reject(fileReadingError);

      });


      /* [ Theory ] For the file reading stream 'close' event fires on normal completion.
       * If we will not utilize the 'fileReadingStream', memory leak will occur. */
      fileReadingStream.on("close", resolve);

      /* [ Theory ] For the response, the writable stream, 'close' event fires when client aborted the connection.
      * If we will not utilize the 'fileReadingStream', memory leak will occur. */
      this.nativeResponse.on("close", (): void => {
        fileReadingStream.destroy();
        resolve();
      });

    });
  }

}


namespace Response {

  export type SuccessfulSubmittingPayload =
      Readonly<
        {
          statusCode?: SuccessfulResponsesHTTP_StatusCodes;
          noCache?: boolean;
        } &
        (
          { JSON_Content: ParsedJSON; } |
          { HTML_Content: string; } |
          { plainTextContent: string; } |
          { filePath: string; }
        )
      >;

  export type ErroredSubmittingPayload =
      Readonly<{
        statusCode: ClientErrorsHTTP_StatusCodes | ServerErrorsHTTP_StatusCodes;
        errorMessage?: string;
        JSON_Content?: ParsedJSON;
        HTML_Content?: string;
        plainTextContent?: string;
      }>;

}


export default Response;
