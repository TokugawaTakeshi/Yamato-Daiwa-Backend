/* ─── Entities ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductCategory from "../../BusinessRules/Entities/Product/ProductCategory";

/* ─── Services ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import type ProductsCategoriesIDsGeneratingService from "../../Services/IDsGenerators/ProductsCategoriesIDsGeneratingService";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import { Logger, ImproperUsageError } from "@yamato-daiwa/es-extensions";


abstract class SampleProductsCategoriesRepository {

  private static hasAlreadyBeenUsed: boolean = false;

  private static readonly workpieces: SampleProductsCategoriesRepository.ProductsCategories = {
    officeDesks: { ID: "__ID_PLACEHOLDER__", name: "Office Desks" },
    kitchenDesks: { ID: "__ID_PLACEHOLDER__", name: "Kitchen Desks" },
    diningTables: { ID: "__ID_PLACEHOLDER__", name: "Dining Tables" },
    sofas: { ID: "__ID_PLACEHOLDER__", name: "Sofas" },
    bedFrames: { ID: "__ID_PLACEHOLDER__", name: "Bed Frames" },
    wardrobes: { ID: "__ID_PLACEHOLDER__", name: "Wardrobes" },
    lighting: { ID: "__ID_PLACEHOLDER__", name: "Lighting" },
    curtainsAndBlinds: { ID: "__ID_PLACEHOLDER__", name: "Curtains & Blinds" },
    bathroomStorage: { ID: "__ID_PLACEHOLDER__", name: "Bathroom Storage" },
    outdoorFurniture: { ID: "__ID_PLACEHOLDER__", name: "Outdoor Furniture" }
  };

  public static async assignIDsAndGetItems(
    IDsGeneratingService: ProductsCategoriesIDsGeneratingService
  ): Promise<SampleProductsCategoriesRepository.ProductsCategories> {

    if (SampleProductsCategoriesRepository.hasAlreadyBeenUsed) {
      Logger.throwErrorAndLog({
        errorInstance: new ImproperUsageError(
          "`SampleProductsCategoriesRepository.setIDsAndRetrieve` is indented to be invoked once whiled has been invoked" +
            "twice."
        ),
        title: ImproperUsageError.localization.defaultTitle,
        occurrenceLocation: "ImproperUsageError.setIDsAndRetrieve(IDsGeneratingService)"
      });
    }


    SampleProductsCategoriesRepository.hasAlreadyBeenUsed = true;

    await Promise.all(
      Object.values(SampleProductsCategoriesRepository.workpieces).map(
        async (productCategory: Omit<ProductCategory, "ID"> & { ID: ProductCategory.ID; }): Promise<void> => {
          productCategory.ID = await IDsGeneratingService.generateID();
        }
      )
    );

    return SampleProductsCategoriesRepository.workpieces;

  }

}


namespace SampleProductsCategoriesRepository {

  export type Workpiece = Omit<ProductCategory, "ID"> & { ID: ProductCategory.ID; };

  export type ProductsCategories = Readonly<{ [keys in ProductsCategories.Keys]: Workpiece; }>;

  export namespace ProductsCategories {

    export type Keys =
        "officeDesks" |
        "kitchenDesks" |
        "diningTables" |
        "sofas" |
        "bedFrames" |
        "wardrobes" |
        "lighting" |
        "curtainsAndBlinds" |
        "bathroomStorage" |
        "outdoorFurniture";

  }

}


export default SampleProductsCategoriesRepository;
