import { isUndefined, isString } from "@yamato-daiwa/es-extensions";
import type { RawObjectDataProcessor } from "@yamato-daiwa/es-extensions";


const BooleanParameterDefaultPreValidationModifier: RawObjectDataProcessor.PreValidationModification =

    (rawValue: unknown): unknown => {

      if (isUndefined(rawValue)) {
        return false;
      }


      if (isString(rawValue)) {

        if (rawValue === "true") {
          return true;
        }


        if (rawValue === "false") {
          return false;
        }
      }


      return rawValue;

    };


export default BooleanParameterDefaultPreValidationModifier;
