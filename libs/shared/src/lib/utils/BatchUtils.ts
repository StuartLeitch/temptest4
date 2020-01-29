export class BatchUtils {
  public static withTimeout<T>(
    callBack: (batch: T[]) => any,
    batchSize: number,
    timeout: number
  ): (batch: T[]) => any {
    let batch = [];
    let timeoutHandler;

    return function(objectList) {
      function cleanBatch() {
        while (batch.length) {
          callBack(batch.splice(0, batchSize));
        }
      }

      if (timeoutHandler) {
        clearTimeout(timeoutHandler);
      }

      batch.push(...objectList);

      if (batch.length < batchSize) {
        timeoutHandler = setTimeout(cleanBatch, timeout);
      } else {
        cleanBatch();
      }
    };
  }

  public static generatorWithTimeout<T, U = void>(
    callBack: (batch: T[]) => U,
    batchSize: number,
    timeout: number
  ): (generator: AsyncGenerator<T, any, unknown>) => Promise<void> {
    let timeoutHandler: NodeJS.Timeout;
    let batch: T[] = [];

    const clearBatch = () => {
      while (batch.length) {
        callBack(batch.splice(0, batchSize));
      }
    };

    return async generator => {
      timeoutHandler = setTimeout(clearBatch, timeout);

      for await (const obj of generator) {
        batch.push(obj);

        if (batch.length >= batchSize) {
          clearTimeout(timeoutHandler);
          clearBatch();
          timeoutHandler = setTimeout(clearBatch, timeout);
        }
      }

      if (timeoutHandler) {
        clearTimeout(timeoutHandler);
      }
    };
  }
}
