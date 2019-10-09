// * Core Domain
import {Result} from '../../../core/logic/Result';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';

import {Product, ProductProps} from './Product';

/**
 * The Creator class declares the factory method that is supposed to return an
 * object of a Product class. The Creator's subclasses usually provide the
 * implementation of this method.
 */
export abstract class BaseProductCreator {
  /**
   * Note that the Creator may also provide some default implementation of the
   * factory method.
   */
  public abstract create(
    props: ProductProps,
    id?: UniqueEntityID
  ): Result<Product>;
  /**
   * Also note that, despite its name, the Creator's primary responsibility is
   * not creating products. Usually, it contains some core business logic that
   * relies on Product objects, returned by the factory method. Subclasses can
   * indirectly change that business logic by overriding the factory method
   * and returning a different type of product from it.
   */
  // public someOperation(): string {
  //   // Call the factory method to create a Product object.
  //   const productOrError = this.create();
  //   // Now, use the product.
  //   return `Product Creator: The same creator's code has just worked with ${
  //     productOrError.getValue().type
  //   }`;
  // }
}
