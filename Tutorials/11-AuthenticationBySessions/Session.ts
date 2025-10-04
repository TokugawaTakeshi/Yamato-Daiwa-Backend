import * as YDB from "@yamato-daiwa/backend";
import SessionData from "./SessionData";


export default class Session extends YDB.Session<SessionData> {

  public save(): Promise<void> {
    return Promise.resolve();
  }

}
