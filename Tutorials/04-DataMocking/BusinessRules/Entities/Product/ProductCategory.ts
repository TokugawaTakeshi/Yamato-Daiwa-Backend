import { FIXED_CHARACTERS_COUNT_IN_NANO_ID } from "fundamental-constants";


type ProductCategory = {
  readonly ID: ProductCategory.ID;
  name: string;
};


namespace ProductCategory {

  export const NAME: string = "ProductCategory";

  export type ID = string;
  export namespace ID {
    export const NAME: string = "ID";
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const FIXED_CHARACTERS_COUNT: number = FIXED_CHARACTERS_COUNT_IN_NANO_ID;
  }

  export namespace Name {
    export const NAME: string = "name";
    export const TYPE: StringConstructor = String;
    export const REQUIRED: boolean = true;
    export const MINIMAL_CHARACTERS_COUNT: number = 2;
    export const MAXIMAL_CHARACTERS_COUNT: number = 100;
  }

}


export default ProductCategory;
