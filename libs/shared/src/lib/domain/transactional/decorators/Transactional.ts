import 'reflect-metadata';

import { NAMESPACE_NAME } from './../common';
import { IsolationLevel } from './../IsolationLevel';
import { Propagation } from './../Propagation';
import { runInNewHookContext } from './../Hook';

export type TRANSACTIONAL = '__Transactional__';

export const Transactional = (options?: {
  connectionName?: string;
  propagation?: Propagation;
  isolationLevel?: IsolationLevel;
}) => {
  const connectionName: string =
    options && options.connectionName ? options.connectionName : 'default';
  const propagation: Propagation =
    options && options.propagation ? options.propagation : Propagation.REQUIRED;
  const isolationLevel: IsolationLevel | undefined =
    options && options.isolationLevel;

  console.info(`connectionName = ${connectionName}`);
  console.info(`propagationStrategy = ${propagation}`);
  console.info(`isolationLevel = ${isolationLevel}`);

  return (
    target: any, // Class of the decorated method
    methodName: string | symbol, // method name
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const context = NAMESPACE_NAME;
      const runOriginal = async () => originalMethod.apply(this, [...args]);
      const runWithNewHook = async () =>
        runInNewHookContext(context, runOriginal);

      const runWithNewTransaction = async () => {
        const transactionCallback = async (entityManager: any) => {
          // setEntityManagerForConnection(connectionName, context, entityManager)
          const result = await originalMethod.apply(this, [...args]);
          // setEntityManagerForConnection(connectionName, context, null)
          return result;
        };

        if (isolationLevel) {
          return await runInNewHookContext(context, () => {
            return context;
            // getManager(connectionName).transaction(
            //   isolationLevel,
            //   transactionCallback
            // )
          });
        } else {
          // return await runInNewHookContext(context, () =>
          //   getManager(connectionName).transaction(transactionCallback)
          // );
        }
      };

      return runOriginal();
    };

    Reflect.getMetadataKeys(originalMethod).forEach((previousMetadataKey) => {
      const previousMetadata = Reflect.getMetadata(
        previousMetadataKey,
        originalMethod
      );
      Reflect.defineMetadata(
        previousMetadataKey,
        previousMetadata,
        descriptor.value
      );
    });

    Object.defineProperty(descriptor.value, 'name', {
      value: originalMethod.name,
      writable: false,
    });
  };
};
