export interface ServiceErrorContract {
  readonly originatingService: string;
  readonly rawError?: Error;
  readonly message: string;

  toString(): string;
}
