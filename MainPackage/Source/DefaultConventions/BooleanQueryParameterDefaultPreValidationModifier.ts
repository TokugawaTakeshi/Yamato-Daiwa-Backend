import { isString } from "@yamato-daiwa/es-extensions";
import type { RawObjectDataProcessor } from "@yamato-daiwa/es-extensions";


const BooleanQueryParameterDefaultPreValidationModifier: RawObjectDataProcessor.PreValidationModification =

    (rawValue: unknown): unknown => {

      if (isString(rawValue)) {

        if (rawValue === "true" || rawValue === "") {
          return true;
        }


        if (rawValue === "false") {
          return false;
        }

      }


      return rawValue;

    };


export default BooleanQueryParameterDefaultPreValidationModifier;
