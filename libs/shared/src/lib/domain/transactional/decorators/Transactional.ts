// import { Result } from '../../../core/logic/Result';

import { IsolationLevel } from './../IsolationLevel';
import { Propagation } from './../Propagation';

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

  return (
    target: any, // Class of the decorated method
    methodName: string | symbol, // method name
    descriptor: TypedPropertyDescriptor<any>
  ) => {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
      const runOriginal = async () => originalMethod.apply(this, [...args]);

      // const runWithNewTransaction = async () => {
      //   const transactionCallback = async (entityManager: any) => {
      //     const result = await originalMethod.apply(this, [...args]);
      //     return result;
      //   };

      //   if (isolationLevel) {
      //     return await runInNewHookContext(context, () =>
      //       getManager(connectionName).transaction(
      //         isolationLevel,
      //         transactionCallback
      //       )
      //     );
      //   } else {
      //     return await runInNewHookContext(context, () =>
      //       getManager(connectionName).transaction(transactionCallback)
      //     );
      //   }
      // };

      return runOriginal();
    };

    Reflect.getMetadataKeys(originalMethod).forEach(previousMetadataKey => {
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
      writable: false
    });
  };
};
