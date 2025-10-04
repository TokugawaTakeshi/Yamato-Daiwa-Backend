import type { ParsedJSON_Object } from "@yamato-daiwa/es-extensions";


type URI_QueryParametersDeserializer = (rawQueryParametersWithoutLeadingQuestionMark: string) => ParsedJSON_Object;


export default URI_QueryParametersDeserializer;
