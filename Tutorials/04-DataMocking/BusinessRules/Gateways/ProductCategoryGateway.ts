import type ProductCategory from "../Entities/Product/ProductCategory";


interface ProductCategoryGateway {

  retrieveSelection: (
    requestParameters: ProductCategoryGateway.SelectionRetrieving.RequestParameters
  ) => Promise<ProductCategoryGateway.SelectionRetrieving.ResponseData>;

  retrieveExpectedToBeExistingOne: (targetCategoryID: ProductCategory.ID) => Promise<ProductCategory>;

  addOne: (requestData: ProductCategoryGateway.Adding.RequestData) => Promise<ProductCategoryGateway.Adding.AddedCategoryID>;

  updateOne: (updatedCategory: ProductCategory) => Promise<void>;

  deleteOne: (targetCategoryID: ProductCategory.ID) => Promise<void>;

}


namespace ProductCategoryGateway {

  export namespace SelectionRetrieving {

    export type RequestParameters = Readonly<{
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      searchingByFullOrPartialName?: string;
    }>;

    export type ResponseData = Readonly<{
      itemsOfTargetPaginationPage: Array<ProductCategory>;
      selectionItemsCount: number;
      totalItemsCount: number;
    }>;

  }

  export namespace Adding {
    export type RequestData = Readonly<Pick<ProductCategory, "name">>;
    export type AddedCategoryID = ProductCategory.ID;
  }

}


export default ProductCategoryGateway;
