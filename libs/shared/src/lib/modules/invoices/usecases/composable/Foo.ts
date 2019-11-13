export class FooUseCase {
  public async execute(fooArg: any): Promise<string> {
    // return Promise.resolve(`[FooUseCase]: ${fooArg}`);
    return new Promise((resolve, reject) => {
      Math.random() > 0.5
        ? // ? resolve(`[FooUseCase]: ${fooArg}`)
          resolve({message: `[FooUseCase]: ${fooArg}`})
        : reject(`[FooUseCase]: rejected!`);
    });
  }
}
