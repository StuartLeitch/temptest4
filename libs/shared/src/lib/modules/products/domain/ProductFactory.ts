import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';

import {Product, ProductProps} from './Product';
import {ArticlePublishingCostCreator} from './ArticlePublishingCostCreator';
import {PrintOrderCreator} from './PrintOrderCreator';

enum ProductTypes {
  APC = 'APC',
  PRINT_ORDER = 'PrintOrder'
}

export class ProductFactory {
  public static createProduct(
    type: string,
    props: ProductProps,
    id?: UniqueEntityID
  ): Product {
    if (type === ProductTypes.APC) {
      const apcCreator = new ArticlePublishingCostCreator();
      return apcCreator.create(props, id).getValue();
    } else if (type === ProductTypes.PRINT_ORDER) {
      const printOrderCreator = new PrintOrderCreator();
      return printOrderCreator.create(props, id).getValue();
    }

    return null;
  }
}
