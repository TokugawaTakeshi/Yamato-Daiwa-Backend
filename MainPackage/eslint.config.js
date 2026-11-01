const YamatoDaiwaStyleGuides = require("@yamato-daiwa/style_guides/ECMAScript");


module.exports = [

  {
    ignores: [
      "Distributable/*"
    ]
  },

  ...YamatoDaiwaStyleGuides,

  {
    languageOptions: {
      parserOptions: {
        project: "tsconfig.eslint.json"
      }
    }
  },

  {
    files: [ "Source/**/*.ts" ],
    ignores: [ "Source/HTTP_Methods.ts" ],
    rules: {
      "no-restricted-imports":
        [
          "error",
          {
            paths: [
              {
                name: "@yamato-daiwa/es-extensions",
                importNames: [ "HTTP_Methods" ],
                message: "Use the enums from Source/HTTP_Methods.ts instead."
              },
              {
                name: "fundamental-constants",
                importNames: [ "HTTP_Methods" ],
                message: "Use the enums from Source/HTTP_Methods.ts instead."
              }
            ]
          }
        ]
    }
  }

];
