import type { ParsedJSON } from "@yamato-daiwa/es-extensions";


export default abstract class Session<SessionData extends ParsedJSON> {

  protected data: SessionData;
  protected readonly validityPeriod__seconds: number;
  protected expirationDateTime: Date;


  protected constructor(
    {
      sessionData,
      validityPeriod__seconds
    }: Readonly<{
      sessionData: SessionData;
      validityPeriod__seconds: number;
    }>
  ) {
    this.data = sessionData;
    this.validityPeriod__seconds = validityPeriod__seconds;
    this.expirationDateTime = new Date(new Date().getSeconds() + this.validityPeriod__seconds);
  }


  public abstract save(): Promise<void>;


  public setDataButNotSaveYet(updatedSessionDataFields: Partial<SessionData>): void {
    this.data = {
      ...this.data,
      ...updatedSessionDataFields
    };
  }

  public async setDataAndSave(updatedSessionDataFields: Partial<SessionData>): Promise<void> {
    this.setDataButNotSaveYet(updatedSessionDataFields);
    return this.save();
  }

  public resetExpirationTimer(): void {
    this.expirationDateTime = new Date(new Date().getSeconds() + this.validityPeriod__seconds);
  }

}
