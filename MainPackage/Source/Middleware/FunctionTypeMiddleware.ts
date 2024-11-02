import type Request from "../Request/Request";
import type Response from "../Response/Response";
import type Server from "../Server/Server";
import type Middleware from "./Middleware";


type FunctionTypeMiddleware<
  PossiblyCustomRequest extends Request = Request
> = (
  required: PossiblyCustomRequest,
  response: Response,
  serverConfig: Server.NormalizedConfiguration
) =>
    Promise<Middleware.CompletionSignals>;


export default FunctionTypeMiddleware;
