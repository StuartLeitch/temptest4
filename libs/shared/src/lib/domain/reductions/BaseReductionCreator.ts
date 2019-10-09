// * Core Domain
import {Result} from '../../../core/logic/Result';
import {UniqueEntityID} from '../../../core/domain/UniqueEntityID';

import {Reduction, ReductionProps} from './Reduction';

/**
 * The Creator class declares the factory method that is supposed to return an
 * object of a Reduction class. The Creator's subclasses usually provide the
 * implementation of this method.
 */
export abstract class BaseReductionCreator {
  /**
   * Note that the Creator may also provide some default implementation of the
   * factory method.
   */
  public abstract create(
    props: ReductionProps,
    id?: UniqueEntityID
  ): Result<Reduction>;
  /**
   * Also note that, despite its name, the Creator's primary responsibility is
   * not creating reduction. Usually, it contains some core business logic that
   * relies on Reduction objects, returned by the factory method. Subclasses can
   * indirectly change that business logic by overriding the factory method
   * and returning a different type of reduction from it.
   */
  // public someOperation(): string {
  //   // Call the factory method to create a Reduction object.
  //   const reductionOrError = this.create();
  //   // Now, use the reduction.
  //   return `Reduction Creator: The same creator's code has just worked with ${
  //     reductionOrError.getValue().type
  //   }`;
  // }
}
