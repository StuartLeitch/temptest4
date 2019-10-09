export interface Config {
  defaultConcurrency: number;
  consumeConcurrencies: {[queueName: string]: number};

  getConcurrency(queueName: string): number;
}

export class ConfigContract implements Config {
  defaultConcurrency = 1;
  consumeConcurrencies: {[queueName: string]: number} = {};

  public getConcurrency(queueName: string): number {
    if (this.consumeConcurrencies && this.consumeConcurrencies[queueName]) {
      return this.consumeConcurrencies[queueName];
    }

    return this.defaultConcurrency;
  }
}
