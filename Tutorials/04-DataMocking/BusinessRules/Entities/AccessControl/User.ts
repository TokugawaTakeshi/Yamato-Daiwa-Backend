import {
  EMAIL_ADDRESS_VALID_PATTERN,
  MAXIMAL_CHARACTERS_COUNT_OF_EMAIL_ADDRESS,
  MINIMAL_CHARACTERS_COUNT_OF_EMAIL_ADDRESS
} from "fundamental-constants";


type User = {
  emailAddress: string;
  displayingName: string;
  authorityRole: User.AuthorityRoles;
  hashedPassword: string;
};


namespace User {

  export const NAME: string = "User";


  export namespace EmailAddress {
    export const NAME: string = "emailAddress";
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const MINIMAL_CHARACTERS_COUNT: number = MINIMAL_CHARACTERS_COUNT_OF_EMAIL_ADDRESS;
    export const MAXIMAL_CHARACTERS_COUNT: number = MAXIMAL_CHARACTERS_COUNT_OF_EMAIL_ADDRESS;
    export const REGULAR_EXPRESSION: RegExp = EMAIL_ADDRESS_VALID_PATTERN;
  }


  export namespace DisplayingName {
    export const NAME: string = "displayingName";
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const MINIMAL_CHARACTERS_COUNT: number = 2;
    export const MAXIMAL_CHARACTERS_COUNT: number = 250;
  }


  export enum AuthorityRoles {
    admin = "admin",
    editor = "editor"
  }

  export namespace AuthorityRole {
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const ALLOWED_VALUES: Array<AuthorityRoles> = Object.values(AuthorityRoles);
  }


  export namespace HashedPassword {
    export const NAME: string = "hashedPassword";
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
  }

  export namespace Password {

    export const TYPE: StringConstructor = String;

    export const MINIMAL_CHARACTERS_COUNT: number = 8;
    export const MAXIMAL_CHARACTERS_COUNT: number = 36;

    export const ALLOWED_NON_WORD_CHARACTERS: ReadonlyArray<string> = [
      "!",
      "@",
      "#",
      "$",
      "^",
      "*",
      "-",
      "_",
      "+",
      "=",
      "{",
      "}",
      "[",
      "]",
      "|",
      "\\",
      "/",
      ":",
      ";",
      "<",
      ">",
      ",",
      ".",
      "?"
    ];

  }

}


export default User;
