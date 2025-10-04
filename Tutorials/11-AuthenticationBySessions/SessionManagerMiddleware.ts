import SessionData from "./SessionData";
import Request from "./Request";
import * as YDB from "@yamato-daiwa/backend";
import Session from "./Session";


export default class SessionManagerMiddleware extends YDB.SessionManagerMiddleware<SessionData, Request> {

  public constructor() {
    super({
      mustRefreshSessionOnEachAccess: true,
      mustCreateSessionDataForNonAuthenticatedUsers: true,
      secretString: "test"
    });
  }

  protected override getSessionDataByID(sessionID: string): Promise<SessionData | null> {
    return Promise.resolve(sessionID === "f7e28b07-8fd4-48ca-b217-5810362128a758bf846da52e81a56ca3ea6366b044b6db5977720afe846eb3bfbc033bfee6b1" ? { userID: "BLA" } : null);
  }

  protected override createSessionAndAddToRequest(request: Request, sessionData: SessionData): Session {
    return request.session = new Session({
      sessionData,
      validityPeriod__seconds: 1000
    });
  }

}
