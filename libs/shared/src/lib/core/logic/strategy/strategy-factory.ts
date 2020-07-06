import { Behavior } from './behavior';
import { Strategy } from './strategy';

export interface StrategyFactory<T extends Strategy, V = void, U = void> {
  /**
   * Build and returns a specific strategy, depending on the type
   * given as parameter
   *
   * @param type - The name of the kind of strategy wanted, given as a Symbol
   * @returns A new instance of the kind of strategy requested
   */
  getStrategy(type: V): Promise<T>;

  /**
   * Build and return a suitable strategy for the provided data
   *
   * @param data - What is needed to decide what strategy should be built
   * @returns A new instance of the appropriate strategy
   */
  selectStrategy(data: U): Promise<T>;
}
