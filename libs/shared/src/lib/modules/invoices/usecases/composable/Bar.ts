export class BarUseCase {
  public async execute(barArg: any, fooResult?: any): Promise<string> {
    return Promise.resolve(`[BarUseCase]: ${barArg} - ${fooResult}`);
  }
}
