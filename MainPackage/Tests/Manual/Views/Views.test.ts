import ArticleController from "./Controllers/ArticleController";
import * as YDB from "../../../Source";


YDB.Server.initializeAndStart({
  IP_Address: "127.0.0.1",
  HTTP: { port: 1337 },
  routing: [ ArticleController ]
});
