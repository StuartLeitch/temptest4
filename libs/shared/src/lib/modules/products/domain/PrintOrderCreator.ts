import {Result} from '../../../core/logic/Result';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';

import {BaseProductCreator} from './BaseProductCreator';
import {ProductProps} from './Product';
import {PrintOrder} from './PrintOrder';

/**
 * Concrete Creators override the factory method in order to change the
 * resulting product's type.
 */

export class PrintOrderCreator extends BaseProductCreator {
  /**
   * Note that the signature of the method still uses the abstract product
   * type, even though the concrete product is actually returned from the
   * method. This way the Creator can stay independent of concrete product
   * classes.
   */
  public create(props: ProductProps, id?: UniqueEntityID): Result<PrintOrder> {
    const printOrderProduct = new PrintOrder(
      {
        ...props,
        type: 'PrintOrder'
      },
      id
    );
    return Result.ok<PrintOrder>(printOrderProduct);
  }
}
