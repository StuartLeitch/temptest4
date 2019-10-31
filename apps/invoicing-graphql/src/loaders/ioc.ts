import {
  MicroframeworkLoader,
  MicroframeworkSettings
} from 'microframework-w3tec';

import {Container} from 'typedi';
// import {useContainer as typeGraphQLUseContainer} from 'type-graphql';
// import {useContainer as ormUseContainer} from 'typeorm';
import {useContainer as classValidatorUseContainer} from 'class-validator';
import {useContainer as routingUseContainer} from 'routing-controllers';

export const iocLoader: MicroframeworkLoader = (
  settings: MicroframeworkSettings | undefined
) => {
  /**
   * Setup routing-controllers to use typedi container.
   */
  routingUseContainer(Container);
  // ormUseContainer(Container);
  classValidatorUseContainer(Container);
  // typeGraphQLUseContainer(Container);
};
