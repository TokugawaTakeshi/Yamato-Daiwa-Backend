namespace Middleware {
  export enum CompletionSignals {
    toNextMiddleware = "TO_NEXT_MIDDLEWARE",
    finishRequestHandling = "FINISH_RESPONSE_HANDLING"
  }
}


export default Middleware;
