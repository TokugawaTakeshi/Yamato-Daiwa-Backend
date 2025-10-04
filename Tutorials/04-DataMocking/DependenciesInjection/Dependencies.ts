import type ProductGateway from "../BusinessRules/Gateways/ProductGateway";
import type ProductCategoryGateway from "../BusinessRules/Gateways/ProductCategoryGateway";


type Dependencies = Readonly<{
  gateways: Dependencies.Gateways;
}>;


namespace Dependencies {

  export type Gateways = Readonly<{
    product: ProductGateway;
    productCategory: ProductCategoryGateway;
  }>;

}


export default Dependencies;
