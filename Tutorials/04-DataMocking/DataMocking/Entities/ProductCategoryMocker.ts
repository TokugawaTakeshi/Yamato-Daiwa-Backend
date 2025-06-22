/* ─── Entities ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import ProductCategory from "../../BusinessRules/Entities/Product/ProductCategory";

/* ─── Services ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductsCategoriesIDsGeneratingService from
    "../../Services/IDsGenerators/ProductsCategoriesIDsGeneratingService";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  getRandomString,
  getArithmeticMean,
  adjustCharactersCount,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";


export default abstract class ProductCategoryMocker {

  public static async generate(
    {
      requirements,
      preDefinedFields = {},
      options = {}
    }: Readonly<{
      requirements: Readonly<{
        IDsGenerator: ProductsCategoriesIDsGeneratingService;
      }>;
      preDefinedFields?: Partial<ProductCategory>;
      options?: Readonly<{ nameInfixForSearchingImitation?: string; }>;
    }>
  ): Promise<ProductCategory> {

    const ID: ProductCategory.ID = preDefinedFields.ID ?? await requirements.IDsGenerator.generateID();

    const name: string = isNotUndefined(preDefinedFields.name) ?
        adjustCharactersCount({
          targetString: preDefinedFields.name,
          minimalCharactersCount: ProductCategory.Name.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: ProductCategory.Name.MAXIMAL_CHARACTERS_COUNT,
          filling: { toStart: true },
          cropping: { fromEnd: true }
        }) :
        getRandomString({
          minimalCharactersCount: ProductCategory.Name.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: ProductCategory.Name.MAXIMAL_CHARACTERS_COUNT,
          ...isNotUndefined(options.nameInfixForSearchingImitation) ? { infix: options.nameInfixForSearchingImitation } : null,
          minimalRandomlyGeneratedCharactersCount: getArithmeticMean(
              ProductCategory.Name.MINIMAL_CHARACTERS_COUNT,
              ProductCategory.Name.MAXIMAL_CHARACTERS_COUNT
          )
        });

    return {
      ID,
      name
    };

  }

}
