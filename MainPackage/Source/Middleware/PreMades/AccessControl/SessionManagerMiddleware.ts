/* ─── Native Modules ─────────────────────────────────────────────────────────────────────────────────────────────── */
import Crypto from "crypto";

/* ─── Framework's Constituents ───────────────────────────────────────────────────────────────────────────────────── */
import ClassTypeMiddleware from "../../ClassTypeMiddleware";
import type Request from "../../../Request/Request";
import type Response from "../../../Response/Response";
import type Session from "../../../AccessControl/Session";
import Middleware from "../../Middleware";

/* ─── General Utils ──────────────────────────────────────────────────────────────────────────────────────────────── */
import {
  DataRetrievingFailedError,
  isNotNull,
  isNotUndefined,
  Logger,
  type ParsedJSON
} from "@yamato-daiwa/es-extensions";


abstract class SessionManagerMiddleware<
  SessionData extends ParsedJSON,
  PossiblyCustomRequest extends Request = Request
> extends ClassTypeMiddleware< PossiblyCustomRequest> {

  /* ━━━ Protected Fields ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  protected readonly secretString: string;
  protected readonly sessionID_CookieKey: string;
  protected readonly mustRefreshSessionOnEachAccess: boolean;
  protected readonly mustCreateSessionDataForNonAuthenticatedUsers: boolean;


  /* ━━━ Constructor ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  protected constructor(
    {
      secretString,
      sessionID_CookieKey = "SESSION_ID",
      mustRefreshSessionOnEachAccess = true,
      mustCreateSessionDataForNonAuthenticatedUsers
    }: Readonly<{
      secretString: string;
      sessionID_CookieKey?: string;
      mustRefreshSessionOnEachAccess: boolean;
      mustCreateSessionDataForNonAuthenticatedUsers: boolean;
    }>
  ) {
    super();
    this.secretString = secretString;
    this.sessionID_CookieKey = sessionID_CookieKey;
    this.mustRefreshSessionOnEachAccess = mustRefreshSessionOnEachAccess;
    this.mustCreateSessionDataForNonAuthenticatedUsers = mustCreateSessionDataForNonAuthenticatedUsers;
  }

  /* ━━━ Protected Abstract Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  protected abstract getSessionDataByID(sessionID: string): Promise<SessionData | null>;

  protected abstract createSessionAndAddToRequest(
    request: PossiblyCustomRequest, sessionData: SessionData
  ): Session<SessionData>;


  /* ━━━ Public Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  public override async handleRequest(
    request: PossiblyCustomRequest, response: Response
  ): Promise<Middleware.CompletionSignals> {

    let sessionID: string | undefined = request.parsedCookies.get(this.sessionID_CookieKey);
    let sessionData: SessionData | null = null;

    if (isNotUndefined(sessionID)) {

      try {

        sessionData = await this.getSessionDataByID(sessionID);

        Logger.logInfo({
          title: "SessionData",
          description: "",
          additionalData: {
            sessionData
          }
        });

      } catch (error: unknown) {

        Logger.throwErrorAndLog({
          errorInstance: new DataRetrievingFailedError({ mentionToData: "SessionData" }),
          title: DataRetrievingFailedError.localization.defaultTitle,
          occurrenceLocation: "{InheritorOf}sessionManager.handleRequest(request, response, serverConfig)",
          innerError: error
        });

      }

      if (isNotNull(sessionData)) {

        const session: Session<SessionData> = this.createSessionAndAddToRequest(request, sessionData);

        if (this.mustRefreshSessionOnEachAccess) {

          session.resetExpirationTimer();

        }

      }

      return Middleware.CompletionSignals.toNextMiddleware;

    }


    if (this.mustCreateSessionDataForNonAuthenticatedUsers) {

      sessionID = await this.generateSessionID();

      response.setHeaders({
        "Set-Cookie": [ `${ this.sessionID_CookieKey }=${ sessionID }` ]
      });

    }


    return Middleware.CompletionSignals.toNextMiddleware;

  }


  /* ━━━ Protected Methods ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
  protected async generateSessionID(): Promise<string> {
    const universallyUniqueIdentifier: string = Crypto.randomUUID();
    return Promise.resolve(
      `${ universallyUniqueIdentifier }${ Crypto.hash("sha256", universallyUniqueIdentifier + this.secretString) }`
    );
  }

}


namespace SessionManagerMiddleware {

}


export default SessionManagerMiddleware;
