import type Request from "../../Request/Request";
import type Response from "../../Response/Response";
import ClassTypeMiddleware from "../ClassTypeMiddleware";
import Middleware from "../Middleware";


export default class CORS_Middleware extends ClassTypeMiddleware {

  public override async handleRequest(_request: Request, response: Response): Promise<Middleware.CompletionSignals> {
    response.setHeaders({ "Access-Control-Allow-Origin": "*" });
    return Promise.resolve(Middleware.CompletionSignals.toNextMiddleware);
  }

}
