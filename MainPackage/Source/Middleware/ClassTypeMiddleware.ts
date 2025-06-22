import type Request from "../Request/Request";
import type Response from "../Response/Response";
import type Server from "../Server/Server";
import type Middleware from "./Middleware";


export default abstract class ClassTypeMiddleware<PossiblyCustomRequest extends Request = Request> {

  public abstract handleRequest(
    request: PossiblyCustomRequest, response: Response, serverConfiguration: Server.NormalizedConfiguration
  ): Promise<Middleware.CompletionSignals>;

}
