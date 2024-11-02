import ProductCategory from "../../BusinessRules/Entities/ProductCategory";

import { v4 as generateUniversallyUniqueIdentifierOfVersion4 } from "uuid";
import {
  getRandomString,
  getArithmeticMean,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";


export default class ProductCategoryMocker {

  public static generate(
      preDefinedFields: Partial<ProductCategory>,
      options: Readonly<{ nameInfixForSearchingImitation?: string; }> = {}
  ): ProductCategory {

    const ID: ProductCategory.ID = preDefinedFields.ID ?? generateUniversallyUniqueIdentifierOfVersion4();

    const name: string =
        preDefinedFields.name ??
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
