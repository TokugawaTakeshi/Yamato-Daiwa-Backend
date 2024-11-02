import Session from "./Session";
import * as YDB from "@yamato-daiwa/backend";


export default class Request extends YDB.Request {

  public session: Session | null = null;

}
