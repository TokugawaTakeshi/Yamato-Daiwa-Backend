/* eslint-disable @typescript-eslint/member-ordering -- 特別な整理方法。 */

/* ─── Entities ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type Product from "../BusinessRules/Entities/Product/Product";
import type ProductCategory from "../BusinessRules/Entities/Product/ProductCategory";

/* ─── Gateways ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductCategoryGateway from "../BusinessRules/Gateways/ProductCategoryGateway";
import type ProductGateway from "../BusinessRules/Gateways/ProductGateway";

/* ─── Services ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductsIDsGeneratingService from "../Services/IDsGenerators/ProductsIDsGeneratingService";
import ProductsIDsGeneratingServiceForMockDataSource from "./IDsGenerators/ProductsIDsGeneratingServiceForMockDataSource";
import type ProductsCategoriesIDsGeneratingService from "../Services/IDsGenerators/ProductsCategoriesIDsGeneratingService";
import ProductsCategoriesIDsGeneratingServiceForMockDataSource from
    "./IDsGenerators/ProductsCategoriesIDsGeneratingServiceForMockDataSource";

/* ─── Data ───────────────────────────────────────────────────────────────────────────────────────────────────────── */
import ProductsCategoriesCollectionsMocker from "./Collections/ProductsCategoriesCollectionsMocker";
import ProductsCollectionsMocker from "./Collections/ProductsCollectionsMocker";
import SampleProductsCategoriesRepository from "./SamplesRepositories/SampleProductsCategoriesRepository";
import SampleProductsRepository from "./SamplesRepositories/SampleProductsRepository";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  getItemsOfPaginationPage,
  Logger,
  isNonEmptyString,
  isNotUndefined,
  DataMocking
} from "@yamato-daiwa/es-extensions";


export default class MockDataSource {

  /* ━━━ Data ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  public readonly productsCategories: Array<ProductCategory> = [];
  public readonly products: Array<Product> = [];

  /* ─── Subscribers ──────────────────────────────────────────────────────────────────────────────────────────────── */


  /* ━━━ IDs Generators ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  public readonly IDsGenerators: Readonly<{
    product: ProductsIDsGeneratingService;
    productCategory: ProductsCategoriesIDsGeneratingService;
  }> = {
    product: new ProductsIDsGeneratingServiceForMockDataSource(),
    productCategory: new ProductsCategoriesIDsGeneratingServiceForMockDataSource()
  };


  /* ━━━ Initialization ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  private static selfSoleInstance: MockDataSource | null = null;
  private static initialization: Promise<MockDataSource> | null = null;

  public static async initializeAndGetInstance(): Promise<MockDataSource> {
    return MockDataSource.selfSoleInstance ??
      MockDataSource.initialization ??
      (
        MockDataSource.initialization = new Promise<MockDataSource>(
          (resolve: (mockDataSource: MockDataSource) => void): void => {

            const selfSoleInstance: MockDataSource = new MockDataSource();

            selfSoleInstance.
                initialize().
                then((): void => {

                  MockDataSource.selfSoleInstance = selfSoleInstance;
                  MockDataSource.initialization = null;

                  resolve(selfSoleInstance);

                }).
                catch(Logger.logPromiseError);

          }
        )
      );
  }

  private async initialize(): Promise<void> {

    const meaningfulProductsCategories: SampleProductsCategoriesRepository.ProductsCategories =
        await SampleProductsCategoriesRepository.assignIDsAndGetItems(this.IDsGenerators.productCategory);

    this.productsCategories.push(
      ...Object.values(meaningfulProductsCategories),
      ...await ProductsCategoriesCollectionsMocker.generate({
        mockingOrder: [
          {
            nameInfixForSearchingImitation: "-SEARCHING_TEST-",
            quantity: 3
          },
          {
            completelyRandom: true,
            quantity: 2
          }
        ],
        requirements: {
          productsCategoriesIDsGenerator: new ProductsCategoriesIDsGeneratingServiceForMockDataSource()
        }
      })
    );

    this.products.push(
      ...await SampleProductsRepository.assignDependenciesAndGetItems({
        IDsGeneratingService: this.IDsGenerators.product,
        meaningfulProductsCategories
      }),
      ...await ProductsCollectionsMocker.generate({
        mockingOrder: [
          {
            quantity: 10,
            optionalPropertiesDecisionStrategy:
                DataMocking.OptionalPropertiesDecisionStrategies.mustGenerateWith50PercentageProbability
          }
        ],
        requirements: {
          categories: this.productsCategories,
          productsIDsGenerator: this.IDsGenerators.product
        }
      })
    );

    Logger.logSuccess({
      title: "Mock Data Source Initialization Complete",
      description: "Mock data source has been initialized. This feature must not be in production mode."
    });

  }


  /* ━━━ Transactions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  /* ─── Product Category ─────────────────────────────────────────────────────────────────────────────────────────── */
  public retrieveProductsCategoriesSelection(
    {
      itemsCountPerPaginationPage,
      paginationPageNumber,
      searchingByFullOrPartialName
    }: ProductCategoryGateway.SelectionRetrieving.RequestParameters
  ): ProductCategoryGateway.SelectionRetrieving.ResponseData {

    let productsCategoriesSelection: Array<ProductCategory> = [ ...this.productsCategories ];

    if (isNonEmptyString(searchingByFullOrPartialName)) {

      productsCategoriesSelection = productsCategoriesSelection.filter(
        (productCategory: ProductCategory): boolean => productCategory.name.includes(searchingByFullOrPartialName)
      );

    }

    return {
      itemsOfTargetPaginationPage: getItemsOfPaginationPage({
        targetPageNumber__numerationFrom1: paginationPageNumber,
        items: productsCategoriesSelection,
        itemsCountPerPaginationPage
      }),
      selectionItemsCount: productsCategoriesSelection.length,
      totalItemsCount: this.productsCategories.length
    };

  }


  /* ─── Product ──────────────────────────────────────────────────────────────────────────────────────────────────── */
  public retrieveProductsSelection(
    {
      itemsCountPerPaginationPage,
      paginationPageNumber,
      searchingByFullOrPartialTitle,
      categoryID
    }: ProductGateway.SelectionRetrieving.RequestParameters
  ): ProductGateway.SelectionRetrieving.ResponseData {

    let productsSelection: Array<Product> = [ ...this.products ];

    if (isNotUndefined(categoryID)) {

      productsSelection = productsSelection.filter(
        (product: Product): boolean => product.category.ID === categoryID
      );

    }


    if (isNonEmptyString(searchingByFullOrPartialTitle)) {

      productsSelection = productsSelection.filter(
        (product: Product): boolean => product.title.includes(searchingByFullOrPartialTitle)
      );

    }

    return {
      itemsOfTargetPaginationPage: getItemsOfPaginationPage({
        targetPageNumber__numerationFrom1: paginationPageNumber,
        items: productsSelection,
        itemsCountPerPaginationPage
      }),
      selectionItemsCount: productsSelection.length,
      totalItemsCount: this.productsCategories.length
    };

  }

}
