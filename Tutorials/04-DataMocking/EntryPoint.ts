import DependenciesInjector from "./DependenciesInjection/DependenciesInjector";

import ProductMockGateway from "./DataMocking/Gateways/ProductMockGateway";
import ProductCategoryMockGateway from "./DataMocking/Gateways/ProductCategoryMockGateway";

import ProductController from "./ProductController";

import type { Request, Response } from "@yamato-daiwa/backend";
import { Server, ProtocolDependentDefaultPorts } from "@yamato-daiwa/backend";
import { HTTP_Methods } from "@yamato-daiwa/es-extensions";


DependenciesInjector.setDependencies({
  gateways: {
    product: new ProductMockGateway(),
    productCategory: new ProductCategoryMockGateway()
  }
});

/* Running the test:
*  ts-node EntryPoint.ts
* */
Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: ProtocolDependentDefaultPorts.HTTP },
  routing: [

    {
      HTTP_Method: HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: Request, response: Response): Promise<void> {
        return response.submitWithSuccess({
          HTML_Content: "<h1>Top page</h1>"
        });
      }
    },

    ProductController

  ]
});
