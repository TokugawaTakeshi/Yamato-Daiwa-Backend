import type Product from "../../BusinessRules/Entities/Product";
import type ProductCategory from "../../BusinessRules/Entities/ProductCategory";
import ProductMocker from "../Entities/ProductMocker";
import type { DataMocking } from "@yamato-daiwa/es-extensions";


class ProductsCollectionsMocker {

  public static generate(
    {
      mockingOrder,
      dependencies
    }: Readonly<{
      mockingOrder: ProductsCollectionsMocker.MockingOrder;
      dependencies: {
        categories: ReadonlyArray<ProductCategory>;
      };
    }>
  ): Array<Product> {

    const accumulatingCollection: Array<Product> = [];

    for (const subset of mockingOrder) {

      const itemsQuantity: number = "quantity" in subset ? subset.quantity : subset.withTitles.length;

      for (let itemNumber: number = 1; itemNumber <= itemsQuantity; itemNumber++) {
        accumulatingCollection.push(ProductMocker.generate({
          preDefinedFields: {
            ..."withTitles" in subset ? { title: subset.withTitles[itemNumber - 1] } : null
          },
          dependencies: {
            categories: dependencies.categories
          },
          options: {
            optionalPropertiesDecisionStrategy: subset.optionalPropertiesDecisionStrategy,
            ..."nameInfixForSearchingImitation" in subset ? {
              nameInfixForSearchingImitation: subset.nameInfixForSearchingImitation
            } : null
          }

        }));

      }

    }

    return accumulatingCollection;

  }

}


namespace ProductsCollectionsMocker {

  export type MockingOrder = Array<Subset>;

  export type Subset = Readonly<
    {
      completelyRandom: true;
      optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
      quantity: number;
    } |
    {
      withTitles: Array<string>;
      optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
    } |
    {
      nameInfixForSearchingImitation: string;
      optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
      quantity: number;
    }
  >;

}


export default ProductsCollectionsMocker;
