import { Config } from './config';
import { GraphqlAdapter, RestAdapter } from './services';

export class Context {
  public graphqlAdapter: GraphqlAdapter;
  public restAdapter: RestAdapter;

  constructor(config: Config) {
    this.graphqlAdapter = new GraphqlAdapter(config.gqlRoot);
    this.restAdapter = new RestAdapter(config.apiRoot);
  }
}
