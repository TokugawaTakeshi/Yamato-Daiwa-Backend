/* ─── Entities ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import ProductCategory from "../../../BusinessRules/Entities/Product/ProductCategory";

/* ─── Services ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import { StringTypeID_Generator } from "@yamato-daiwa/es-extensions";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import { nanoid as generateNanoID } from "nanoid";


export default abstract class ProductCategoriesIDsGeneratingService extends StringTypeID_Generator {

  public constructor() {
    super({
      ID_CharactersCount: ProductCategory.ID.FIXED_CHARACTERS_COUNT,
      relatedEntityName: ProductCategory.NAME,
      collisionsCountLimit: 10
    });
  }

  protected override generateID_ButNotValidateYet(): string {
    return generateNanoID();
  }

}
