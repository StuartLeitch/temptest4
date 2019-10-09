import {Config} from './Config';

export class Service {
  config: Config;

  constructor(config: any) {
    this.config = new Config(config);
  }
}
