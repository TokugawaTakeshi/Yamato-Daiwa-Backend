import Testing from "node:test";
import Asset from "assert";
import { Logger } from "@yamato-daiwa/es-extensions";
import parseCookieHTTP_Header from "../../../Source/Utils/parseCookieHTTP_Header";


type TestMetadata = Readonly<{
  title: string;
  rawCookeHeader: string;
  parsedCookies: Map<string, string>;
}>;


Promise.all(
  [

    {
      title: "Basic key-value pairs",
      rawCookeHeader: "sessionId=abc123; theme=dark; loggedIn=true",
      parsedCookies: new Map<string, string>([
        [ "sessionId", "abc123" ],
        [ "theme", "dark" ],
        [ "loggedIn", "true" ]
      ])
    },

    {
      title: "URL-encoded value",
      rawCookeHeader: "user=John%20Doe; role=admin",
      parsedCookies: new Map<string, string>([
        [ "user", "John Doe" ],
        [ "role", "admin" ]
      ])
    },

    {
      title: "JSON-stringified object as value",
      rawCookeHeader: "preferences=%7B%22lang%22%3A%22en%22%2C%22tz%22%3A%22JST%22%7D",
      parsedCookies: new Map<string, string>([
        [ "preferences", '{"lang":"en","tz":"JST"}' ]
      ])
    },

    {
      title: "Value with special characters",
      rawCookeHeader: "token=abc123!@#$%^&*()_+-=; flag=on",
      parsedCookies: new Map<string, string>([
        [ "token", "abc123!@#$%^&*()_+-=" ],
        [ "flag", "on" ]
      ])
    },

    {
      title: "Duplicate key (last one wins)",
      rawCookeHeader: "debug=false; debug=true",
      parsedCookies: new Map<string, string>([
        [ "debug", "true" ]
      ])
    },

    {
      title: "Value with equal sign inside",
      rawCookeHeader: "auth=Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
      parsedCookies: new Map<string, string>([
        [ "auth", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" ]
      ])
    },

    {
      title: "Empty value and another key",
      rawCookeHeader: "empty=; stillSet=yes",
      parsedCookies: new Map<string, string>([
        [ "empty", "" ],
        [ "stillSet", "yes" ]
      ])
    },

    {
      title: "Mixed formatting and extra spaces",
      rawCookeHeader: "   spacedKey = spacedValue  ; trimmedKey=trimmedValue   ",
      parsedCookies: new Map<string, string>([
        [ "spacedKey", "spacedValue" ],
        [ "trimmedKey", "trimmedValue" ]
      ])
    },

    {
      title: "Key without value",
      rawCookeHeader: "lonelyFlag; theme=light",
      parsedCookies: new Map<string, string>([
        [ "lonelyFlag", "" ],
        [ "theme", "light" ]
      ])
    },

    {
      title: "Multiple tricky cookies, including duplicate key",
      rawCookeHeader: "a=1; b=2; c=%7B%22x%22%3A%5B1%2C2%2C3%5D%7D; debug=on; a=3",
      parsedCookies: new Map<string, string>([
        [ "a", "3" ],
        [ "b", "2" ],
        [ "c", '{"x":[1,2,3]}' ],
        [ "debug", "on" ]
      ])
    }

  ].map(
    async ({ title, rawCookeHeader, parsedCookies }: TestMetadata): Promise<void> => Testing.test(

        title,

        (): void => {
          Asset.deepStrictEqual(parseCookieHTTP_Header(rawCookeHeader), parsedCookies);
        }

    )
  )
).catch(Logger.logPromiseError);
