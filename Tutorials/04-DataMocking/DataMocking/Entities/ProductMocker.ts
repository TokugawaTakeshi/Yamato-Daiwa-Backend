import Product from "../../BusinessRules/Entities/Product";
import ProductCategory from "../../BusinessRules/Entities/ProductCategory";

import { v4 as generateUniversallyUniqueIdentifierOfVersion4 } from "uuid";
import {
  getRandomString,
  getRandomInteger,
  getArithmeticMean,
  DataMocking,
  InvalidParameterValueError,
  Logger,
  isNotUndefined,
  getRandomArrayElement
} from "@yamato-daiwa/es-extensions";



export default abstract class ProductMocker {

  private static counterForID_Generating: number = 0;


  public static generate(
      {
        preDefinedFields = {},
        dependencies,
        options
      }: Readonly<{
        preDefinedFields: Partial<Product>;
        dependencies: Readonly<{
          categories: ReadonlyArray<ProductCategory>;
        }>;
        options: Readonly<{
          optionalPropertiesDecisionStrategy: DataMocking.OptionalPropertiesDecisionStrategies;
          nameInfixForSearchingImitation?: string;
        }>;
      }>
  ): Product {

    if (Product.Category.REQUIRED && dependencies.categories.length === 0) {
      Logger.throwErrorAndLog({
        errorInstance: new InvalidParameterValueError({
          parameterNumber: 1,
          parameterName: "compoundObject",
          messageSpecificPart:
              "The `dependencies.categories` property must the non-empty array because the category field is required."
        }),
        title: InvalidParameterValueError.localization.defaultTitle,
        occurrenceLocation: "ProductMocker.generate()"
      });
    }


    const ID: Product.ID =
        preDefinedFields.ID ??
        generateUniversallyUniqueIdentifierOfVersion4();

    const title: string =
        preDefinedFields.title ??
        getRandomString({
          minimalCharactersCount: Product.Title.MINIMAL_CHARACTERS_COUNT,
          maximalCharactersCount: Product.Title.MAXIMAL_CHARACTERS_COUNT,
          ...isNotUndefined(options.nameInfixForSearchingImitation) ? { infix: options.nameInfixForSearchingImitation } : null,
          minimalRandomlyGeneratedCharactersCount: getArithmeticMean(
              Product.Title.MINIMAL_CHARACTERS_COUNT, Product.Title.MAXIMAL_CHARACTERS_COUNT
          )
        });

    const description: string | undefined = DataMocking.decideOptionalValue({
      strategy: options.optionalPropertiesDecisionStrategy,
      preDefinedValue: preDefinedFields.description,
      randomValueGenerator: (): string => getRandomString({
        minimalCharactersCount: Product.Description.MINIMAL_CHARACTERS_COUNT,
        maximalCharactersCount: Product.Description.MAXIMAL_CHARACTERS_COUNT
      })
    });

    const category: ProductCategory = isNotUndefined(preDefinedFields.category) ?
        preDefinedFields.category : getRandomArrayElement(dependencies.categories);

    const quantityRemainInStock: number | undefined = DataMocking.decideOptionalValue({
      strategy: options.optionalPropertiesDecisionStrategy,
      preDefinedValue: preDefinedFields.quantityRemainInStock,
      randomValueGenerator: (): number => getRandomInteger({
        minimalValue: Product.Price__Dollars__WithoutTax.MINIMAL_VALUE,
        maximalValue: Product.Price__Dollars__WithoutTax.MAXIMAL_VALUE
      })
    });

    const price__dollars__includingTax: number =
        preDefinedFields.price__dollars__includingTax ??
        getRandomInteger({
          minimalValue: Product.Price__Dollars__WithoutTax.MINIMAL_VALUE,
          maximalValue: Product.Price__Dollars__WithoutTax.MAXIMAL_VALUE
        });

    return {
      ID,
      title,
      ...isNotUndefined(description) ? { description } : null,
      category,
      quantityRemainInStock,
      price__dollars__includingTax
    };

  }

}
