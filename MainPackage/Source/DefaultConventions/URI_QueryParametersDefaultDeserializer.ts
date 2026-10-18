import type URI_QueryParametersDeserializer from "../URI_QueryParametersDeserializer";
import QueryString from "qs";
import { type ParsedJSON_Object } from "@yamato-daiwa/es-extensions";


const URI_QueryParametersDefaultDeserializer: URI_QueryParametersDeserializer =

    (rawQueryParametersWithoutLeadingQuestionMark: string): ParsedJSON_Object =>

        QueryString.parse(rawQueryParametersWithoutLeadingQuestionMark);


export default URI_QueryParametersDefaultDeserializer;
