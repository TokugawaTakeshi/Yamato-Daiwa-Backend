import * as YDB from "@yamato-daiwa/backend";
// import Path from "path";


YDB.Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: YDB.ProtocolDependentDefaultPorts.HTTP },
  HTTPS: {
    port: YDB.ProtocolDependentDefaultPorts.HTTPS,
    // SSL_CertificateFileRelativeOrAbsolutePath: Path.resolve(__dirname, "./SSL/SSL_Certificate.pem"),
    // SSL_KeyFileRelativeOrAbsolutePath: Path.resolve(__dirname, "./SSL/SSL_Key.pem"),
    SSL_CertificateFileRelativeOrAbsolutePath: "SSL/SSL_Certificate.pem",
    SSL_KeyFileRelativeOrAbsolutePath: "SSL/SSL_Key.pem"
  },
  routing: [
    {
      HTTP_Method: YDB.HTTP_Methods.get,
      pathTemplate: "/",
      async handler(_request: YDB.Request, response: YDB.Response): Promise<void> {
        return response.submitWithSuccess({ HTML_Content: "<h1>Hello, world!</h1>" });
      }
    }
  ]
});
