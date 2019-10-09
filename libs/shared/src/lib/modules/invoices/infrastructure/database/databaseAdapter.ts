// import {DatabaseAdapterConstructor} from './contracts/databaseAdapterConstructor';
import {DatabaseAdapterConfigContract} from './contracts/databaseAdapterConfig';

/**
 * The abstract generic class for database adapters.
 * @template T
 */
export abstract class AbstractDatabaseAdapter<T> {
  /**
   * Registers the database adapter and returns the name (identifier) it chose.
   * @param {string} name
   * @param {databaseAdapterConstructor<any>} adapterClass
   * @returns {string}
   */
  protected static register(
    name: string
    // adapterClass: databaseAdapterConstructor<any>
  ): string {
    // lib.defineAdapter(name, adapterClass);
    return name;
  }

  /**
   * The configuration for the database adapter.
   */
  protected _config: DatabaseAdapterConfigContract;

  /**
   * The database module's database object that can be used for raw operations.
   */
  protected _handle: T;

  protected constructor(config: DatabaseAdapterConfigContract) {
    this._config = config;
  }

  /**
   * Attempts to connect to the database.
   * This should throw an Error when the connection couldn't be established.
   */
  public abstract async connect(): Promise<void>;

  /**
   * Creates the database (schema).
   */
  public abstract async create(): Promise<void>;

  /**
   * Attempts to repair the database.
   * This could be recreating the schema (calling `create`) / file (in a NoSQL case).
   */
  public abstract async repair(): Promise<void>;

  /**
   * Should validate that the database's schema is intact.
   */
  public abstract async validate(): Promise<void>;

  /**
   * This method defines what to do when connections to the database fail.
   */
  public abstract async handleUnreachable(): Promise<void>;

  /**
   * Returns a connected state.
   * The adapter defines, when it's "connected".
   */
  public abstract get connected(): boolean;

  /**
   * Returns the handle.
   */
  protected get handle(): T {
    return this._handle;
  }

  /**
   * Sets the handle.
   * @param {T} handle The handle to set
   */
  protected set handle(handle: T) {
    this._handle = handle;
  }

  /**
   * Returns the adapter's configuration.
   * @returns {DatabaseAdapterConfigContract}
   */
  protected get config(): DatabaseAdapterConfigContract {
    return this._config;
  }
}
