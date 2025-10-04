/* ─── Entities ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type Product from "../../BusinessRules/Entities/Product/Product";
import type ProductCategory from "../../BusinessRules/Entities/Product/ProductCategory";

/* ─── Data ───────────────────────────────────────────────────────────────────────────────────────────────────────── */
import ProductMocker from "../Entities/ProductMocker";

/* ─── Services ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductsIDsGeneratingService from "../../Services/IDsGenerators/ProductsIDsGeneratingService";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import { DataMocking } from "@yamato-daiwa/es-extensions";


abstract class ProductsCollectionsMocker {

  public static async generate(
    {
      mockingOrder,
      requirements: {
        productsIDsGenerator,
        categories
      }
    }: Readonly<{
      mockingOrder: ProductsCollectionsMocker.MockingOrder;
      requirements: Readonly<{
        productsIDsGenerator: ProductsIDsGeneratingService;
        categories: ReadonlyArray<ProductCategory>;
      }>;
    }>
  ): Promise<Array<Product>> {

    const accumulatingCollection: Array<Product> = [];

    for (const subset of mockingOrder) {

      const itemsQuantity: number = "quantity" in subset ? subset.quantity : subset.withTitles.length;

      for (let itemNumber: number = 1; itemNumber <= itemsQuantity; itemNumber++) {

        accumulatingCollection.push(
          /* eslint-disable-next-line no-await-in-loop -- 平行に生成すると、「accumulatingCollection」の順番が期待と違う事がある。 */
          await ProductMocker.generate({
            requirements: {
              IDsGenerator: productsIDsGenerator,
              categories
            },
            preDefinedFields: {
              ..."withTitles" in subset ? { title: subset.withTitles[itemNumber - 1] } : null
            },
            options: {
              optionalPropertiesDecisionStrategy: "optionalPropertiesDecisionStrategy" in subset ?
                  subset.optionalPropertiesDecisionStrategy :
                  DataMocking.OptionalPropertiesDecisionStrategies.mustGenerateWith50PercentageProbability,
              ..."nameInfixForSearchingImitation" in subset ?
                  { nameInfixForSearchingImitation: subset.nameInfixForSearchingImitation } : null
            }
          })
        );

      }

    }

    return accumulatingCollection;

  }

}


namespace ProductsCollectionsMocker {

  export type MockingOrder = ReadonlyArray<Subset>;

  export type Subset = Readonly<
    {
      optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
      nameInfixForSearchingImitation?: string;
      quantity: number;
    } |
    {
      withTitles: ReadonlyArray<string>;
    }
  >;

}


export default ProductsCollectionsMocker;
