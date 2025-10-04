/* ─── Entities ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import Product from "../../BusinessRules/Entities/Product/Product";
import type ProductCategory from "../../BusinessRules/Entities/Product/ProductCategory";

/* ─── Services ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductsIDsGeneratingService from "../../Services/IDsGenerators/ProductsIDsGeneratingService";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  DataMocking,
  getRandomString,
  getRandomInteger,
  getRandomArrayElement,
  getArithmeticMean,
  adjustCharactersCount,
  limitMinimalAndMaximalValues,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";


export default abstract class ProductMocker {

  public static async generate(
    {
      requirements,
      preDefinedFields = {},
      options
    }: Readonly<{
      requirements: Readonly<{
        IDsGenerator: ProductsIDsGeneratingService;
        categories: ReadonlyArray<ProductCategory>;
      }>;
      preDefinedFields: Partial<Product>;
      options: Readonly<{
        optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
        nameInfixForSearchingImitation?: string;
      }>;
    }>
  ): Promise<Product> {

    const ID: ProductCategory.ID = preDefinedFields.ID ?? await requirements.IDsGenerator.generateID();

    const title: string = isNotUndefined(preDefinedFields.title) ?
        adjustCharactersCount({
          targetString: preDefinedFields.title,
          minimalCharactersCount: Product.Title.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: Product.Title.MAXIMAL_CHARACTERS_COUNT,
          filling: { toStart: true },
          cropping: { fromEnd: true }
        }) :
        getRandomString({
          minimalCharactersCount: Product.Title.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: Product.Title.MAXIMAL_CHARACTERS_COUNT,
          ...isNotUndefined(options.nameInfixForSearchingImitation) ? { infix: options.nameInfixForSearchingImitation } : null,
          minimalRandomlyGeneratedCharactersCount: getArithmeticMean(
              Product.Title.MINIMAL_CHARACTERS_COUNT, Product.Title.MAXIMAL_CHARACTERS_COUNT
          )
        });

    const description: string | undefined = DataMocking.decideOptionalValue({
      ...isNotUndefined(preDefinedFields.description) ?
          {
            preDefinedValue: adjustCharactersCount({
              targetString: preDefinedFields.description,
              minimalCharactersCount: Product.Title.MINIMAL_CHARACTERS_COUNT,
              maximalCharactersCount: Product.Title.MAXIMAL_CHARACTERS_COUNT,
              filling: { toStart: true },
              cropping: { fromEnd: true }
            })
          } : null,
      randomValueGenerator: (): string => getRandomString({
        minimalCharactersCount: Product.Description.MINIMAL_CHARACTERS_COUNT,
        maximalCharactersCount: Product.Description.MAXIMAL_CHARACTERS_COUNT
      }),
      strategy: options.optionalPropertiesDecisionStrategy
    });

    const category: ProductCategory = preDefinedFields.category ?? getRandomArrayElement(requirements.categories);

    const price__yens__includingTax: number =
        isNotUndefined(preDefinedFields.price__yens__includingTax) ?
            limitMinimalAndMaximalValues({
              targetNumber: preDefinedFields.price__yens__includingTax,
              minimalValue: Product.Price__Yens__WithoutTax.MINIMAL_VALUE,
              maximalValue: Product.Price__Yens__WithoutTax.MAXIMAL_VALUE
            }) :
            getRandomInteger({
              minimalValue: Product.Price__Yens__WithoutTax.MINIMAL_VALUE,
              maximalValue: Product.Price__Yens__WithoutTax.MAXIMAL_VALUE
            });

    const quantityRemainInStock: number | undefined = DataMocking.decideOptionalValue({
      ...isNotUndefined(preDefinedFields.quantityRemainInStock) ?
          {
            preDefinedValue: limitMinimalAndMaximalValues({
              targetNumber: preDefinedFields.quantityRemainInStock,
              minimalValue: Product.Price__Yens__WithoutTax.MINIMAL_VALUE,
              maximalValue: Product.Price__Yens__WithoutTax.MAXIMAL_VALUE
            })
          } : null,
      randomValueGenerator: (): number => getRandomInteger({
        minimalValue: Product.QuantityRemainInStock.MINIMAL_VALUE,
        maximalValue: Product.QuantityRemainInStock.MAXIMAL_VALUE
      }),
      strategy: options.optionalPropertiesDecisionStrategy
    });

    return {
      ID,
      title,
      ...isNotUndefined(description) ? { description } : null,
      category,
      price__yens__includingTax,
      ...isNotUndefined(quantityRemainInStock) ? { quantityRemainInStock } : null
    };

  }

}
