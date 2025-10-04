import type ProductCategory from "../../BusinessRules/Entities/ProductCategory";
import type ProductCategoryGateway from "../../BusinessRules/Gateways/ProductCategoryGateway";
import MockDataSource from "../MockDataSource";
import {
  MockGatewayHelper,
  getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne,
  getItemsOfPaginationPage,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";


export default class ProductCategoryMockGateway implements ProductCategoryGateway {

  private readonly mockDataSource: MockDataSource = MockDataSource.getInstance();


  public async retrieveSelection(
    requestParameters: ProductCategoryGateway.SelectionRetrieving.RequestParameters
  ): Promise<ProductCategoryGateway.SelectionRetrieving.ResponseData> {

    let productsCategoriesSelection: Array<ProductCategory> = this.mockDataSource.productsCategories;

    if (isNotUndefined(requestParameters.searchingByFullOrPartialName)) {
      const searchingByFullOrPartialName: string = requestParameters.searchingByFullOrPartialName;
      productsCategoriesSelection = productsCategoriesSelection.filter(
        (productCategory: ProductCategory): boolean => productCategory.name.includes(searchingByFullOrPartialName)
      );
    }

    return MockGatewayHelper.simulateDataRetrieving({
      requestParameters,
      getResponseData: (): ProductCategoryGateway.SelectionRetrieving.ResponseData => ({
        selectionItemsCount: productsCategoriesSelection.length,
        totalItemsCount: this.mockDataSource.productsCategories.length,
        itemsOfTargetPaginationPage: getItemsOfPaginationPage({
          items: productsCategoriesSelection,
          itemsCountPerPaginationPage: requestParameters.itemsCountPerPaginationPage,
          targetPageNumber__numerationFrom1: 1
        })
      }),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "CategoryMockGateway",
      transactionName: "retrieveSelection"
    });

  }

  public async retrieveExpectedToBeExistingOne(targetProductCategoryID: ProductCategory.ID): Promise<ProductCategory> {
    return MockGatewayHelper.simulateDataRetrieving({
      requestParameters: targetProductCategoryID,
      getResponseData: (): ProductCategory => getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne(
        this.mockDataSource.productsCategories,
        (productCategory: ProductCategory): boolean => productCategory.ID === targetProductCategoryID,
        { mustThrowErrorIfElementNotFoundOrMatchesAreMultiple: true }
      ),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "CategoryMockGateway",
      transactionName: "retrieveExpectedToBeExistingOne"
    });
  }

  public async addOne(requestData: ProductCategoryGateway.Adding.RequestData): Promise<ProductCategoryGateway.Adding.AddedCategoryID> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData,
      getResponseData:
          (): ProductCategoryGateway.Adding.AddedCategoryID =>
              this.mockDataSource.addProductCategory(requestData),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "CategoryMockGateway",
      transactionName: "addOne"
    });
  }

  public async updateOne(updatedCategory: ProductCategory): Promise<void> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData: updatedCategory,
      getResponseData: (): void => { this.mockDataSource.updateCategory(updatedCategory); },
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "CategoryMockGateway",
      transactionName: "updateOne"
    });
  }

  public async deleteOne(targetCategoryID: ProductCategory.ID): Promise<void> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData: targetCategoryID,
      getResponseData: (): void => { this.mockDataSource.deleteCategory(targetCategoryID); },
       mustSimulateError: false,
       minimalPendingPeriod__seconds: 1,
       maximalPendingPeriod__seconds: 2,
       gatewayName: "CategoryMockGateway",
       transactionName: "deleteOne"
    });
  }

}
