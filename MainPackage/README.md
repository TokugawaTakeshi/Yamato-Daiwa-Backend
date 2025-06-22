# Yamato Daiwa Backend 〔YDB〕

[![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@yamato-daiwa/backend)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/TokugawaTakeshi/Yamato-Daiwa-Backend)
![MIT](https://img.shields.io/badge/MIT-green?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/Node%20js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

[![NPM Version](https://img.shields.io/npm/v/@yamato-daiwa/backend)](https://www.npmjs.com/package/@yamato-daiwa/backend)
![Minimal Node Version](https://img.shields.io/badge/Minimal_Node.js_Version-22.0.0-brightgreen.svg?style=flat)
![No any type](https://img.shields.io/badge/Type_Safety-No_any-brightgreen.svg?style=flat)

[![GitHub Sponsors](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/TokugawaTakeshi/Yamato-Daiwa-Backend?sponsor=1)
[![PAYPAL](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://www.paypal.com/paypalme/tokugawatakeshi)
[![LIBERAPAY](	https://img.shields.io/badge/Liberapay-F6C915?style=for-the-badge&logo=liberapay&logoColor=black)](https://liberapay.com/TokugawaT-YD)


![Main visual of Yamato Daiwa Backend framework](https://user-images.githubusercontent.com/41653501/168190921-78edc07d-58cc-4298-8b59-182468cf280a.png)


Back-end framework with built-in TypeScript type safety.
Clean API, no husk.
Intended to be used in full-stack applications where both client and server part written in TypeScript.


+ [Installation](#installation)
+ [Quick Examples](#quick-examples)
  + ["Hello, world!"](#hello-world)
  + [HTTPS Support](#https-support)
  + [Routing and Controllers](#routing-and-controllers)
+ API
  + [Server](https://backend-es.yamato-daiwa.com/API/Server/Server.english.html)


## Installation

```
npm i @yamato-daiwa/backend -E
```


## Quick Examples

> :warning: **Warning:** 
> Below examples has been developed to demonstrate the API of the framework such as easy to understand.
> For this, the splitting of the code to files and code itself has been minified, but this approach is unfit
> for the development of the real applications from the viewpoint of architecture.


### "Hello, world!"

```typescript
import {
  Server,
  Request,
  Response,
  ProtocolDependentDefaultPorts,
  HTTP_Methods
} from "@yamato-daiwa/backend";


/* Running the test:
 *  tsx EntryPoint.ts   OR   npm run start
 * */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({ HTML_Content: "<h1>Hello, world!</h1>" });
      }
    }
  ]
});
```

See the ["Hello, world!"](https://backend-es.yamato-daiwa.com/Tutorials/00-HelloWorld/HelloWorldTutorialPage.english.html) 
  tutorial for the details.


### HTTPS Support

```typescript
import {
  Server,
  Request,
  Response,
  ProtocolDependentDefaultPorts,
  HTTP_Methods
} from "@yamato-daiwa/backend";
import Path from "path";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  HTTPS: {
    
    port: ProtocolDependentDefaultPorts.HTTPS,
    
    SSL_CertificateFileRelativeOrAbsolutePath: "SSL/SSL_Certificate.pem",
    SSL_KeyFileRelativeOrAbsolutePath: "SSL/SSL_Key.pem",
    
    // Or pass the raw strings:
    // SSL_CertificateFileRelativeOrAbsolutePath: Path.resolve(__dirname, "./SSL/SSL_Certificate.pem"),
    // SSL_KeyFileRelativeOrAbsolutePath: Path.resolve(__dirname, "./SSL/SSL_Key.pem"),
    
  },
  routing: [
    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({ HTML_Content: "<h1>Hello, world!</h1>" });
      }
    }
  ]
});
```

See the [HTTPS support](https://backend-es.yamato-daiwa.com/Tutorials/01-HTTPS/HTTPS_TutorialPage.english.html) 
  tutorial for the details.


#### Vs. Express

```typescript
import type { Express as ExpressApplication } from "express";
import type Express from "express";
import createExpressApplication from "express";
import HTTPS from "https";
import FileSystem from "fs";


const expressApplication: ExpressApplication = createExpressApplication();

expressApplication.get(
  "/",
  (_request: Express.Request, response: Express.Response): void => {
    response.send("<h1>Hello, world!</h1>");
  }
);

const HTTPS_Server: HTTPS.Server = HTTPS.createServer(
  {
    key: FileSystem.readFileSync("./SSL/key.pem"),
    cert: FileSystem.readFileSync("./SSL/cert.pem")
  },
  expressApplication
);

HTTPS_Server.listen(443, "127.0.0.1");
```


#### Vs. Express + `routing-controllers`

For the Spring of 2024, the HTTPS example was not documented for **routing-controllers**.
Although the HTTPS usage is possible with **routing-controllers**, the code is pretty verbose:

```typescript
import Express, { type Express as ExpressApplication } from "express";
import createExpressApplication from "express";
import { useExpressServer as supportClassSyntax } from "routing-controllers";

import HTTPS from "https";
import FileSystem from "fs";


const expressApplication: ExpressApplication = createExpressApplication();

expressApplication.get(
  "/",
  (_request: Express.Request, response: Express.Response): void => {
    response.send("<h1>Hello, world!</h1>");
  }
);

const HTTPS_Server: HTTPS.Server = HTTPS.createServer(
  {
    key: FileSystem.readFileSync("./SSL/key.pem"),
    cert: FileSystem.readFileSync("./SSL/cert.pem")
  },
  expressApplication
);

supportClassSyntax(expressApplication);

HTTPS_Server.listen(443, "127.0.0.1");
```


### Routing and Controllers

#### Minimal Example

```typescript
import {
  Server,
  Request,
  Response,
  ProtocolDependentDefaultPorts,
  HTTP_Methods
} from "@yamato-daiwa/backend";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top Page</h1>"
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/products",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Products</h1>"
        });
      }
    },

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/checkout",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Checkout</h1>"
        });
      }
    }

  ]
});
```

See [Functional API](https://backend-es.yamato-daiwa.com/Tutorials/02-RoutingAndControllers/RoutingAndControllersTutorialPage.english.html#ROUTING_IN_YDB-FUNCTIONAL_API--SECTION) 
  section of [Routing and Controllers](https://backend-es.yamato-daiwa.com/Tutorials/02-RoutingAndControllers/RoutingAndControllersTutorialPage.english.html) 
  tutorial for details.


#### Routes with Parameters

```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts, HTTP_Methods } from "@yamato-daiwa/backend";

Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "products/:PRODUCT_ID",
      async handler(request: Request, response: Response): Promise<void> {

        const targetProductID: number = request.validateAndProcessRoutePathParameters<{ PRODUCT_ID: number; }>({
          PRODUCT_ID: {
            preValidationModifications: convertPotentialStringToIntegerIfPossible,
            type: Number,
            numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumberOrZero,
            isUndefinedForbidden: true,
            isNullForbidden: true
          }
        }).PRODUCT_ID;

        return response.submitWithSuccess({
          HTML_Content: `<h1>Product with ID: ${ targetProductID }</h1>`
        });

      }
    },

    // ...

  ]
});
```

See [Defining of Routes with Path Parameters](https://backend-es.yamato-daiwa.com/Tutorials/02-RoutingAndControllers/RoutingAndControllersTutorialPage.english.html#ROUTING_IN_YDB-PATH_PARAMETERS--SECTION) 
  section of [Routing and Controllers](https://backend-es.yamato-daiwa.com/Tutorials/02-RoutingAndControllers/RoutingAndControllersTutorialPage.english.html) 
  tutorial for details.


##### Numeric Parameters

```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import {
  HTTP_Methods,
  convertPotentialStringToNumberIfPossible,
  RawObjectDataProcessor
} from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "products/:PRODUCT_ID",
      async handler(request: Request, response: Response): Promise<void> {

        const targetProductID: number = request.validateAndProcessRoutePathParameters<{ PRODUCT_ID: number; }>({
          PRODUCT_ID: {
            preValidationModifications: convertPotentialStringToNumberIfPossible,
            type: Number,
            numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumberOrZero,
            isNaN_Forbidden: true,
            isUndefinedForbidden: true,
            isNullForbidden: true
          }
        }).PRODUCT_ID;

        return response.submitWithSuccess({
          HTML_Content: `<h1>Product with ID: ${ targetProductID }</h1>`
        });

      }
    },

    // ...

  ]
});
```

See [Numeric Path Parameters](https://backend-es.yamato-daiwa.com/Tutorials/02-RoutingAndControllers/RoutingAndControllersTutorialPage.english.html#ROUTING_IN_YDB-PATH_PARAMETERS-NUMERIC--SECTION) 
  section of [Routing and Controllers](https://backend-es.yamato-daiwa.com/Tutorials/02-RoutingAndControllers/RoutingAndControllersTutorialPage.english.html) 
  tutorial for details.


##### Controllers

```ts
import { Request, Response, Controller } from "@yamato-daiwa/backend";
import {
  HTTP_Methods,
  convertPotentialStringToIntegerIfPossible,
  RawObjectDataProcessor
} from "@yamato-daiwa/es-extensions";


export default class ProductController extends Controller {

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products"
  })
  public async generateProductsPage(_request: Request, response: Response): Promise<void> {    return response.submitWithSuccess({
      HTML_Content: "<h1>Products list</h1>"
    });
  }

  @Controller.RouteHandler({
    HTTP_Method: HTTP_Methods.get,
    pathTemplate: "products/:PRODUCT_ID"
  })
  public async generateProductProfilePage(request: Request, response: Response): Promise<void> {

    const targetProductID: number = request.validateAndProcessRoutePathParameters<{ PRODUCT_ID: number; }>({
      PRODUCT_ID: {
        preValidationModifications: convertPotentialStringToIntegerIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.naturalNumberOrZero,
        isNaN_Forbidden: true,
        isUndefinedForbidden: true,
        isNullForbidden: true
      }
    }).PRODUCT_ID;

    return response.submitWithSuccess({
      HTML_Content: `<h1>Product with ID: ${ targetProductID }</h1>`
    });

  }

}
```

Entry point example:

```typescript

import ProductController from "./Controllers/ProductController";
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top Page</h1>"
        });
      }
    },

    ProductController,
    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/checkout",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Checkout</h1>"
        });
      }
    }

  ]
});
```

See [Controllers](https://backend-es.yamato-daiwa.com/Tutorials/02-RoutingAndControllers/RoutingAndControllersTutorialPage.english.html#ROUTING_IN_YDB-CONTROLLERS--SECTION) 
  section of [Routing and Controllers](https://backend-es.yamato-daiwa.com/Tutorials/02-RoutingAndControllers/RoutingAndControllersTutorialPage.english.html) 
  tutorial for details.


### Dotenv config
#### Entry point

```typescript
import { Server, Request, Response } from "@yamato-daiwa/backend";
import { HTTP_Methods, RawObjectDataProcessor, convertPotentialStringToNumberIfPossible } from "@yamato-daiwa/es-extensions";
import { ObjectDataFilesProcessor } from "@yamato-daiwa/es-extensions-nodejs";


const configFromDotEnvFile: Readonly<{
  IP_ADDRESS: string;
  HTTP_PORT: number;
}> = ObjectDataFilesProcessor.processFile({
  filePath: ".env",
  schema: ObjectDataFilesProcessor.SupportedSchemas.DOTENV,
  validDataSpecification: {
    nameForLogging: "ConfigFromDotenvFile",
    subtype: RawObjectDataProcessor.ObjectSubtypes.fixedKeyAndValuePairsObject,
    properties: {
      IP_ADDRESS: {
        type: String,
        required: true
      },
      HTTP_PORT: {
        preValidationModifications: convertPotentialStringToNumberIfPossible,
        type: Number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        required: true
      }
    }
  }
});


Server.initializeAndStart({
  IP_Address: configFromDotEnvFile.IP_ADDRESS,
  HTTP: { port: configFromDotEnvFile.HTTP_PORT },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    }
  ]
});
```

#### Dotenv file

```dotenv
IP_ADDRESS=127.0.0.1
HTTP_PORT=80
```

See the [Dotenv configuration tutorial](Tutorials/06-DotenvConfig/README.md) for the details.


## Console Line Interface (CLI) configuration

Because the console commands parsing is actual for the console applications, not just for server applications,
the [ConsoleCommandsParser](https://github.com/TokugawaTakeshi/Yamato-Daiwa-ES-Extensions/blob/master/NodeJS/Package/Documentation/ConsoleCommandsParser/ConsoleCommandsParser.md)
utility is available in [@yamato-daiwa/es-extensions-nodejs](https://github.com/TokugawaTakeshi/Yamato-Daiwa-ES-Extensions/blob/master/NodeJS/Package/README.md)
package.


```typescript
import { Server, Request, Response, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";
import { ConsoleCommandsParser, ObjectDataFilesProcessor } from "@yamato-daiwa/es-extensions-nodejs";


const configFromConsoleCommand: ConsoleCommandsParser.ParsedCommand<
  Readonly<{
    IP_Address?: string;
    HTTP_Port?: number;
  }>
> = ConsoleCommandsParser.parse(
  process.argv,
  {
    applicationName: "Server",
    defaultCommand: {
      IP_Address: {
        type: ConsoleCommandsParser.ParametersTypes.string,
        required: false
      },
      HTTP_Port: {
        type: ConsoleCommandsParser.ParametersTypes.number,
        numbersSet: RawObjectDataProcessor.NumbersSets.nonNegativeInteger,
        required: false
      }
    }
  }
);

Server.initializeAndStart({
  IP_Address: configFromConsoleCommand.IP_Address ?? "127.0.0.1",
  HTTP: { port: configFromConsoleCommand.HTTP_Port ?? ProtocolDependentDefaultPorts.HTTP },
  routing: [
    {
      route: { HTTP_Method: HTTP_Methods.get, pathTemplate: "/" },
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    }
  ]
});
```

See the [Console Line Interface configuration](Tutorials/07-ConsoleLineInterface/README.md) for the details.


## Functionality Tutorials

Please take the tutorials in following order.

<dl>

  <dt><a href="https://github.com/TokugawaTakeshi/Yamato-Daiwa-Backend/blob/master/Tutorials/01-HelloWorld/README.md">Hello, World!</a></dt>
  <dd>Retrieving of <b>HTML</b> code by <b>HTTP</b></dd>

  <dt><a href="https://github.com/TokugawaTakeshi/Yamato-Daiwa-Backend/blob/master/Tutorials/02-HTTPS_Support/README.md">HTTPS Support</a></dt>
  <dd>Serving of both <b>HTTP</b> and <b>HTTPS</b></dd>

  <dt><a href="https://github.com/TokugawaTakeshi/Yamato-Daiwa-Backend/blob/master/Tutorials/03-RoutingAndControllers/README.md">Routing and Controllers</a></dt>
  <dd>Defining the routing without and with controllers</dd>

</dl>
