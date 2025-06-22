import type ProductCategory from "./ProductCategory";
import { FIXED_CHARACTERS_COUNT_IN_NANO_ID } from "fundamental-constants";


type Product = {
  readonly ID: Product.ID;
  title: string;
  description?: string;
  category: ProductCategory;
  price__yens__includingTax: number;
  quantityRemainInStock?: number;
};


namespace Product {

  export const NAME: string = "Product";

  export type ID = string;
  export namespace ID {
    export const NAME: string = "ID";
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const FIXED_CHARACTERS_COUNT: number = FIXED_CHARACTERS_COUNT_IN_NANO_ID;
  }

  export namespace Title {
    export const NAME: string = "title";
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const MINIMAL_CHARACTERS_COUNT: number = 2;
    export const MAXIMAL_CHARACTERS_COUNT: number = 200;
  }

  export namespace Description {
    export const NAME: string = "description";
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = false;
    export const MINIMAL_CHARACTERS_COUNT: number = 2;
    export const MAXIMAL_CHARACTERS_COUNT: number = 500;
  }

  export namespace Category {
    export const NAME: string = "category";
    export const TYPE: ObjectConstructor = Object;
    export const REQUIRED: boolean = false;
  }

  export namespace Price__Yens__WithoutTax {
    export const NAME: string = "price__yens__withoutTax";
    export const TYPE: NumberConstructor = Number;
    export const REQUIRED: boolean = true;
    export const MINIMAL_VALUE: number = 1;
    export const MAXIMAL_VALUE: number = Number.MAX_SAFE_INTEGER;
  }

  export namespace QuantityRemainInStock {
    export const NAME: string = "quantityRemainInStock";
    export const TYPE: NumberConstructor = Number;
    export const REQUIRED: boolean = false;
    export const MINIMAL_VALUE: number = 0;
    export const MAXIMAL_VALUE: number = Number.MAX_SAFE_INTEGER;
  }

}


export default Product;
