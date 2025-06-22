import type Product from "../Entities/Product/Product";
import type ProductCategory from "../Entities/Product/ProductCategory";


interface ProductGateway {

  retrieveSelection: (
    requestParameters: ProductGateway.SelectionRetrieving.RequestParameters
  ) => Promise<ProductGateway.SelectionRetrieving.ResponseData>;

  retrieveExpectedToBeExistingOne: (targetProductID: Product.ID) => Promise<Product>;

  addOne: (requestData: ProductGateway.Adding.RequestData) => Promise<ProductGateway.Adding.AddedProductID>;

  updateOne: (updatedProduct: ProductGateway.Updating.RequestData) => Promise<void>;

  deleteOne: (targetProductID: Product.ID) => Promise<void>;

}


namespace ProductGateway {

  export namespace SelectionRetrieving {

    export type RequestParameters = Readonly<{
      paginationPageNumber: number;
      itemsCountPerPaginationPage: number;
      searchingByFullOrPartialTitle?: string;
      categoryID?: ProductCategory.ID;
    }>;

    export type ResponseData = Readonly<{
      itemsOfTargetPaginationPage: Array<Product>;
      selectionItemsCount: number;
      totalItemsCount: number;
    }>;

  }

  export namespace Adding {
    export type RequestData = Readonly<Omit<Product, "ID">>;
    export type AddedProductID = Product.ID;
  }

  export namespace Updating {
    export type RequestData = Readonly<
      Pick<Product, "ID"> &
      Partial<
        Pick<
          Product,
              "title" |
              "price__yens__includingTax"
        >
      > &
      {
        description?: string | null;
        categoryID: ProductCategory.ID;
        quantityRemainInStock?: number | null;
      }
    >;
  }

}


export default ProductGateway;
