import ProductsIDsGeneratingService from "../../Services/IDsGenerators/ProductsIDsGeneratingService";


export default class ProductsIDsGeneratingServiceForMockDataSource extends ProductsIDsGeneratingService {

  private readonly generatedIDs: Set<string> = new Set();

  protected override async isGeneratedID_AvailableForUsage(targetID: string): Promise<boolean> {
    return Promise.resolve(!this.generatedIDs.has(targetID));
  }

  protected override generateID_ButNotValidateYet(): string {
    const generatedID: string = super.generateID_ButNotValidateYet();
    this.generatedIDs.add(generatedID);
    return generatedID;
  }

}
