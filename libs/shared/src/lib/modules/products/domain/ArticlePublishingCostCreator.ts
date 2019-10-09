import {Result} from '../../../core/logic/Result';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';

import {BaseProductCreator} from './BaseProductCreator';
import {ProductProps} from './Product';
import {ArticlePublishingCost} from './ArticlePublishingCost';

/**
 * Concrete Creators override the factory method in order to change the
 * resulting product's type.
 */

export class ArticlePublishingCostCreator extends BaseProductCreator {
  /**
   * Note that the signature of the method still uses the abstract product
   * type, even though the concrete product is actually returned from the
   * method. This way the Creator can stay independent of concrete product
   * classes.
   */
  public create(
    props: ProductProps,
    id?: UniqueEntityID
  ): Result<ArticlePublishingCost> {
    const articlePublishingCostProduct = new ArticlePublishingCost(
      {
        ...props,
        type: 'APC'
      },
      id
    );
    return Result.ok<ArticlePublishingCost>(articlePublishingCostProduct);
  }
}
