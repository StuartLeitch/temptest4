export class BazUseCase {
  public async execute(bazArg: any, barResult?: any): Promise<string> {
    return Promise.resolve(`[BazUseCase]: ${bazArg} - ${barResult}`);
  }
}
