import { InvalidParameterValueError, isNotUndefined, isUndefined, Logger } from "@yamato-daiwa/es-extensions";


class Cookie {

  public static readonly forbiddenForNameSpecialCharacters: ReadonlyArray<string> =
      [ "(", ")", "<", ">", "@", ",", ";", ":", "\\", "\"", "/", "[", "]", "?", "=", "{", "}" ];

  public static readonly forbiddenForValueSpecialCharacters: ReadonlyArray<string> = [ " ", "\"", ",", ";", "\\" ];

  public readonly name: string;
  public readonly namePrefixesUsageWhenPossible: Readonly<{ secure: boolean; host: boolean; }>;
  public readonly value: string;

  public readonly expirationDateTime?: Date;
  public readonly validityPeriod__seconds?: number;

  public readonly visibility: Readonly<{ domain?: string; path?: string; }>;
  public readonly isHTTPS_Required: boolean;
  public readonly isInaccessibleFromClientJavaScript: boolean;


  public constructor(
    {
      name,
      namePrefixesUsageWhenPossible,
      value,
      expirationDateTime,
      validityPeriod__seconds,
      visibility = {},
      isHTTPS_Required,
      isInaccessibleFromClientJavaScript
    }: Readonly<
      Pick<
        Cookie,
        "name" |
        "namePrefixesUsageWhenPossible" |
        "value" |
        "expirationDateTime" |
        "validityPeriod__seconds" |
        "visibility" |
        "isHTTPS_Required" |
        "isInaccessibleFromClientJavaScript"
      > &
      { secondsUntilExpiration?: Date; }
    >
  ) {

    const usedForbiddenCharactersForName: ReadonlyArray<string> = Array.
        from(name).
        filter((character: string): boolean => Cookie.forbiddenForNameSpecialCharacters.includes(character));

    if (usedForbiddenCharactersForName.length > 0) {
      Logger.throwErrorWithFormattedMessage({
        errorInstance: new InvalidParameterValueError({
          parameterNumber: 1,
          parameterName: "Properties",
          messageSpecificPart:
            "The following characters are not allowed for cookie name: \"" +
              `${ usedForbiddenCharactersForName.join("\" , \"") }".`
        }),
        title: InvalidParameterValueError.localization.defaultTitle,
        occurrenceLocation: "Cookie.constructor(properties)"
      });
    }


    this.name = name;
    this.namePrefixesUsageWhenPossible = namePrefixesUsageWhenPossible;

    const usedForbiddenCharactersForValue: ReadonlyArray<string> = Array.
        from(value).
        filter((character: string): boolean => Cookie.forbiddenForValueSpecialCharacters.includes(character));

    if (usedForbiddenCharactersForValue.length > 0) {
      Logger.throwErrorWithFormattedMessage({
        errorInstance: new InvalidParameterValueError({
          parameterNumber: 1,
          parameterName: "Properties",
          messageSpecificPart:
              "The following characters are not allowed for cookie value: \"" +
              `${ usedForbiddenCharactersForValue.join("\" , \"") }".`
        }),
        title: InvalidParameterValueError.localization.defaultTitle,
        occurrenceLocation: "Cookie.constructor(properties)"
      });
    }

    this.value = value;


    /* [ Theory ]
     * `validityPeriod__seconds` (corresponding to `Max-Age` directive) and `expirationDateTime` (corresponding to
     *   `Expires` directive) can be specified simultaneously in on cookie, but the first one has greater priority.) */


    if (isNotUndefined(validityPeriod__seconds)) {
      this.validityPeriod__seconds = validityPeriod__seconds;
    } else if (isNotUndefined(expirationDateTime)) {
      this.expirationDateTime = expirationDateTime;
    }

    this.visibility = visibility;

    this.isHTTPS_Required = isHTTPS_Required;
    this.isInaccessibleFromClientJavaScript = isInaccessibleFromClientJavaScript;

  }

  public serialize(): string {
    return [
      ...this.namePrefixesUsageWhenPossible.secure && this.isHTTPS_Required ? [ "__Secure-" ] : [],
      ...this.namePrefixesUsageWhenPossible.host && isUndefined(this.visibility.domain) && this.visibility.path === "/" ?
            [ "__Host-" ] : [],
      `${ this.name }=${ this.value }`,
      ...isNotUndefined(this.expirationDateTime) ? [ `Expires=${ this.expirationDateTime.toUTCString() }` ] : [],
      ...isNotUndefined(this.validityPeriod__seconds) ? [ `Max-Age=${ this.validityPeriod__seconds }` ] : [],
      ...isNotUndefined(this.visibility) ?
          [
            ...isNotUndefined(this.visibility.domain) ? [ `Domain=${ this.visibility.domain }` ] : [],
            ...isNotUndefined(this.visibility.path) ? [ `Path=${ this.visibility.path }` ] : []
          ] :
          [],
      ...this.isHTTPS_Required ? [ "Secure" ] : [],
      ...this.isInaccessibleFromClientJavaScript ? [ "HttpOnly " ] : []
    ].join(" ;");
  }

}


namespace Cookie {

  export type Name = string;

  export namespace Name {

    export enum Prefixes {
      secure = "__Secure",
      host = "__Host"
    }

  }

}


export default Cookie;
