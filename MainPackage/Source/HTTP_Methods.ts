import { HTTP_Methods as SpecificHTTP_Methods } from "fundamental-constants";


export { HTTP_Methods as SpecificHTTP_Methods } from "fundamental-constants";

export enum HTTP_MethodsExtension {
  all = "ALL"
}


export type HTTP_Methods = SpecificHTTP_Methods | HTTP_MethodsExtension;

export const HTTP_Methods:
    typeof SpecificHTTP_Methods & typeof HTTP_MethodsExtension =
        {
          ...SpecificHTTP_Methods,
          ...HTTP_MethodsExtension
        };


export default HTTP_Methods;
