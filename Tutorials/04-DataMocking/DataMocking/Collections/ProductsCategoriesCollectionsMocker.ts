/* ─── Entities ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductCategory from "../../BusinessRules/Entities/Product/ProductCategory";

/* ─── Data ───────────────────────────────────────────────────────────────────────────────────────────────────────── */
import ProductCategoryMocker from "../Entities/ProductCategoryMocker";

/* ─── Services ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductsCategoriesIDsGeneratingService from "../../Services/IDsGenerators/ProductsCategoriesIDsGeneratingService";


abstract class ProductsCategoriesCollectionsMocker {

  public static async generate(
    {
      mockingOrder,
      requirements: {
        productsCategoriesIDsGenerator
      }
    }: Readonly<{
      mockingOrder: ProductsCategoriesCollectionsMocker.MockingOrder;
      requirements: Readonly<{
        productsCategoriesIDsGenerator: ProductsCategoriesIDsGeneratingService;
      }>;
    }>
  ): Promise<Array<ProductCategory>> {

    const accumulatingCollection: Array<ProductCategory> = [];

    for (const subset of mockingOrder) {

      const itemsQuantity: number = "quantity" in subset ? subset.quantity : subset.withNames.length;

      for (let itemNumber: number = 1; itemNumber <= itemsQuantity; itemNumber++) {

        accumulatingCollection.push(
          /* eslint-disable-next-line no-await-in-loop -- 平行に生成すると、「accumulatingCollection」の順番が期待と違う事がある。 */
          await ProductCategoryMocker.generate({
            requirements: { IDsGenerator: productsCategoriesIDsGenerator },
            preDefinedFields: {
              ..."withNames" in subset ? { name: subset.withNames[itemNumber - 1] } : null
            },
            options: {
              ..."nameInfixForSearchingImitation" in subset ? {
                nameInfixForSearchingImitation: subset.nameInfixForSearchingImitation
              } : {}
            }
          })
        );

      }

    }

    return accumulatingCollection;

  }

}


namespace ProductsCategoriesCollectionsMocker {

  export type MockingOrder = ReadonlyArray<Subset>;

  export type Subset = Readonly<
    {
      completelyRandom: true;
      quantity: number;
    } |
    {
      withNames: ReadonlyArray<string>;
    } |
    {
      nameInfixForSearchingImitation: string;
      quantity: number;
    }
  >;

}


export default ProductsCategoriesCollectionsMocker;
