import { removeNthCharacter, removeSpecificCharacterFromCertainPosition } from "@yamato-daiwa/es-extensions";


export default function removeSlashes(
    targetString: string,
    options: {
      leading: boolean;
      trailing: boolean;
    }
): string {

  let workpiece: string = targetString;

  if (options.leading && workpiece.startsWith("/")) {
    workpiece = removeNthCharacter(workpiece, {
      targetCharacterNumber: 0,
      numerationFrom: 0
    });
  }

  if (options.trailing && workpiece.endsWith("/")) {
    workpiece = removeSpecificCharacterFromCertainPosition({
      targetString: workpiece,
      targetCharacter: "/",
      fromLastPosition: true
    });
  }

  return workpiece;

}
