/* ─── Entities ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import Product from "../../../BusinessRules/Entities/Product/Product";

/* ─── Services ───────────────────────────────────────────────────────────────────────────────────────────────────── */
import { StringTypeID_Generator } from "@yamato-daiwa/es-extensions";

/* ─── Utils ──────────────────────────────────────────────────────────────────────────────────────────────────────── */
import { nanoid as generateNanoID } from "nanoid";


export default abstract class ProductsIDsGeneratingService extends StringTypeID_Generator {

  public constructor() {
    super({
      ID_CharactersCount: Product.ID.FIXED_CHARACTERS_COUNT,
      relatedEntityName: Product.NAME,
      collisionsCountLimit: 10
    });
  }

  protected override generateID_ButNotValidateYet(): string {
    return generateNanoID();
  }

}
