import type Product from "../../BusinessRules/Entities/Product/Product";
import type SampleProductsCategoriesRepository from "./SampleProductsCategoriesRepository";
import type ProductsIDsGeneratingService from "../../Services/IDsGenerators/ProductsIDsGeneratingService";
import { ImproperUsageError, Logger } from "@yamato-daiwa/es-extensions";


export default abstract class SampleProductsRepository {

  private static hasAlreadyBeenUsed: boolean = false;

  public static async assignDependenciesAndGetItems(
    {
      meaningfulProductsCategories,
      IDsGeneratingService
    }: Readonly<{
      IDsGeneratingService: ProductsIDsGeneratingService;
      meaningfulProductsCategories: SampleProductsCategoriesRepository.ProductsCategories;
    }>
  ): Promise<Array<Product>> {

    if (SampleProductsRepository.hasAlreadyBeenUsed) {
      Logger.throwErrorAndLog({
        errorInstance: new ImproperUsageError(
          "`SampleProductsRepository.setIDsAndRetrieve` is indented to be invoked once whiled has been invoked" +
            "twice."
        ),
        title: ImproperUsageError.localization.defaultTitle,
        occurrenceLocation: "SampleProductsRepository.initializeAndGetItems(compoundParameter)"
      });
    }


    SampleProductsRepository.hasAlreadyBeenUsed = true;

    return Promise.all(
      [
        {
          ID: await IDsGeneratingService.generateID(),
          title: "Ergonomic Mesh Office Chair",
          description: "Breathable backrest and adjustable height.",
          category: meaningfulProductsCategories.officeDesks,
          price__yens__includingTax: 12900,
          quantityRemainInStock: 25
        },
        {
          ID: "T5WvQFbzUJeLmKWmNl7aI",
          title: "L-Shaped Office Desk",
          description: "Spacious corner desk with cable grommets.",
          category: meaningfulProductsCategories.officeDesks,
          price__yens__includingTax: 24900,
          quantityRemainInStock: 8
        },
        {
          ID: "a9pZYc0x3sjTKNiLMFHD4",
          title: "Compact Kitchen Island",
          description: "Rolling island with drawers and wine rack.",
          category: meaningfulProductsCategories.kitchenDesks,
          price__yens__includingTax: 17900,
          quantityRemainInStock: 12
        },
        {
          ID: "dTyoWMI3XvZfRBkn89aej",
          title: "Bamboo Kitchen Work Table",
          category: meaningfulProductsCategories.kitchenDesks,
          price__yens__includingTax: 13200
        },
        {
          ID: "Dqt7GX1IzF3yoJtCbZneM",
          title: "Glass Dining Table (6-seater)",
          description: "Tempered glass top with metal frame.",
          category: meaningfulProductsCategories.diningTables,
          price__yens__includingTax: 29800,
          quantityRemainInStock: 5
        },
        {
          ID: "Z7cm2F5WYuOnAv1S8jR4t",
          title: "Rustic Wood Dining Table",
          category: meaningfulProductsCategories.diningTables,
          price__yens__includingTax: 26500,
          quantityRemainInStock: 10
        },
        {
          ID: "MtoAEXq5VnKFYy3jzpCmH",
          title: "3-Seater Fabric Sofa",
          description: "Removable covers and deep seating.",
          category: meaningfulProductsCategories.sofas,
          price__yens__includingTax: 42000,
          quantityRemainInStock: 3
        },
        {
          ID: "pVGzUr3WqkNY6CcBzXT4m",
          title: "Leather Recliner Sofa",
          category: meaningfulProductsCategories.sofas,
          price__yens__includingTax: 58000
        },
        {
          ID: "UKIysqToEzWBJOeMVRPqf",
          title: "Single Bed Frame with Storage",
          description: "Lift-up frame with under-bed compartment.",
          category: meaningfulProductsCategories.bedFrames,
          price__yens__includingTax: 23900,
          quantityRemainInStock: 14
        },
        {
          ID: "Nvya7mYwEtUFGjM95qTzO",
          title: "King Size Bed Frame (Oak)",
          category: meaningfulProductsCategories.bedFrames,
          price__yens__includingTax: 49900
        },
        {
          ID: "ljXCyBVnQTM2zdJr4xGkH",
          title: "Sliding Door Wardrobe",
          description: "Mirror panels and adjustable shelves.",
          category: meaningfulProductsCategories.wardrobes,
          price__yens__includingTax: 37800,
          quantityRemainInStock: 6
        },
        {
          ID: "RnvoWJjTPAZHqfKxLs82n",
          title: "3-Door Wardrobe (White)",
          category: meaningfulProductsCategories.wardrobes,
          price__yens__includingTax: 29800
        },
        {
          ID: "mSTiBvE3Ao8YPVzcF2uG1",
          title: "Floor Lamp with Linen Shade",
          category: meaningfulProductsCategories.lighting,
          price__yens__includingTax: 7200
        },
        {
          ID: "i4qFaPmDEtZu0BcmX7OVW",
          title: "Modern Ceiling Light (LED)",
          category: meaningfulProductsCategories.lighting,
          price__yens__includingTax: 8900
        },
        {
          ID: "WqJ89KXrVafZpTn0mDeC3",
          title: "Blackout Curtains Set",
          description: "Thermal-insulated, 2-panel set.",
          category: meaningfulProductsCategories.curtainsAndBlinds,
          price__yens__includingTax: 5600,
          quantityRemainInStock: 30
        },
        {
          ID: "wU7xbmjG6YzAfLIe4Ro1V",
          title: "Roller Blinds (90x180 cm)",
          category: meaningfulProductsCategories.curtainsAndBlinds,
          price__yens__includingTax: 3300
        },
        {
          ID: "OEvkFlpa1d5R0CjY2yLWN",
          title: "Tall Bathroom Cabinet",
          description: "Slim design with open shelves.",
          category: meaningfulProductsCategories.bathroomStorage,
          price__yens__includingTax: 8400
        },
        {
          ID: "GXWmZ6J3B2sTOkUVrL5nq",
          title: "Under-Sink Storage Rack",
          category: meaningfulProductsCategories.bathroomStorage,
          price__yens__includingTax: 3900
        },
        {
          ID: "y9d5OqkPmAhVRTexJZFKn",
          title: "Folding Garden Table",
          description: "Weather-resistant with steel legs.",
          category: meaningfulProductsCategories.outdoorFurniture,
          price__yens__includingTax: 9400,
          quantityRemainInStock: 18
        },
        {
          ID: "zXLyPNIuS3EqbOMkgJtwV",
          title: "Patio Lounge Set (4-piece)",
          category: meaningfulProductsCategories.outdoorFurniture,
          price__yens__includingTax: 38900
        }
      ].map(
        async (productWorkpiece: Omit<Product, "ID"> & { ID: Product.ID; }): Promise<Product> => ({
          ...productWorkpiece,
          ID: await IDsGeneratingService.generateID()
        })
      )
    );

  }

}
