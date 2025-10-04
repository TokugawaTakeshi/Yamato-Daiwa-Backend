import type Article from "../BusinessRules/Enterprise/Article";
import * as YDB from "../../../../Source";


export default class ArticleController extends YDB.Controller {

  private readonly renderProductsPage: YDB.TemplateEngine.CachedRenderer<ArticleController.ProductsListPage.TemplateParameters> =
      YDB.TemplateEngine.cacheRenderer("Views/Sample.hbs");

  @YDB.Controller.RouteHandler({
    HTTP_Method: YDB.HTTP_Methods.get,
    pathTemplate: "articles"
  })
  public async generateProductsPage(_request: YDB.Request, response: YDB.Response): Promise<void> {
    return response.submitWithSuccess({
      HTML_Content: this.renderProductsPage({
        topHeading: "Test",
        articles: [
          { title: "Article1", URI: "#" },
          { title: "Article2", URI: "#" }
        ],
        sampleBooleanVariable: true
      })
    });
  }

}


namespace ArticleController {

  export namespace ProductsListPage {

    export type TemplateParameters = {
      topHeading: string;
      articles: Array<Article>;
      sampleBooleanVariable: true;
    };
  }
}
