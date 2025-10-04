import type Request from "../Request";
import type Response from "../Response";
import type Server from "../Server/Server";
import type Middleware from "./Middleware";


type FunctionTypeMiddleware<
  PossiblyCustomRequest extends Request = Request
> = (
  request: PossiblyCustomRequest,
  response: Response,
  serverConfiguration: Server.NormalizedConfiguration
) =>
    Promise<Middleware.CompletionSignals>;


export default FunctionTypeMiddleware;
