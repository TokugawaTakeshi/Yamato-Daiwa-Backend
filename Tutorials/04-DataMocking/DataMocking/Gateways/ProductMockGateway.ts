import type Product from "../../BusinessRules/Entities/Product";
import type ProductGateway from "../../BusinessRules/Gateways/ProductGateway";
import MockDataSource from "../MockDataSource";
import {
  MockGatewayHelper,
  getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne,
  getItemsOfPaginationPage,
  isNotUndefined
} from "@yamato-daiwa/es-extensions";


export default class ProductMockGateway implements ProductGateway {

  private readonly mockDataSource: MockDataSource = MockDataSource.getInstance();


  public async retrieveSelection(
    requestParameters: ProductGateway.SelectionRetrieving.RequestParameters
  ): Promise<ProductGateway.SelectionRetrieving.ResponseData> {

    let productsSelection: Array<Product> = this.mockDataSource.products;

    if (isNotUndefined(requestParameters.searchingByFullOrPartialTitle)) {
      const searchingByFullOrPartialName: string = requestParameters.searchingByFullOrPartialTitle;
      productsSelection = productsSelection.filter(
        (product: Product): boolean => product.title.includes(searchingByFullOrPartialName)
      );
    }

    return MockGatewayHelper.simulateDataRetrieving({
      requestParameters,
      getResponseData: (): ProductGateway.SelectionRetrieving.ResponseData => ({
        selectionItemsCount: productsSelection.length,
        totalItemsCount: this.mockDataSource.products.length,
        itemsOfTargetPaginationPage: getItemsOfPaginationPage({
          items: productsSelection,
          itemsCountPerPaginationPage: requestParameters.itemsCountPerPaginationPage,
          targetPageNumber__numerationFrom1: 1
        })
      }),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "retrieveSelection"
    });

  }

  public async retrieveExpectedToBeExistingOne(targetProductID: Product.ID): Promise<Product> {
    return MockGatewayHelper.simulateDataRetrieving({
      requestParameters: targetProductID,
      getResponseData: (): Product => getArrayElementSatisfiesThePredicateIfSuchElementIsExactlyOne(
        this.mockDataSource.products,
        (product: Product): boolean => product.ID === targetProductID,
        { mustThrowErrorIfElementNotFoundOrMatchesAreMultiple: true }
      ),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "retrieveExpectedToBeExistingOne"
    });
  }

  public async addOne(
    requestData: ProductGateway.Adding.RequestData
  ): Promise<ProductGateway.Adding.AddedProductID> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData,
      getResponseData: (): ProductGateway.Adding.AddedProductID => this.mockDataSource.addProduct(requestData),
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "addOne"
    });
  }

  public async updateOne(updatedProduct: ProductGateway.Updating.RequestData): Promise<void> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData: updatedProduct,
      getResponseData: (): void => { this.mockDataSource.updateProduct(updatedProduct); },
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "updateOne"
    });
  }

  public async deleteOne(targetProductID: Product.ID): Promise<void> {
    return MockGatewayHelper.simulateDataSubmitting({
      requestData: targetProductID,
      getResponseData: (): void => { this.mockDataSource.deleteProduct(targetProductID); },
      mustSimulateError: false,
      minimalPendingPeriod__seconds: 1,
      maximalPendingPeriod__seconds: 2,
      mustLogResponseData: false,
      gatewayName: "ProductMockGateway",
      transactionName: "deleteOne"
    });
  }

}
