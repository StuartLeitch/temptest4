export class BatchUtils {
  public static withTimeout<T>(
    callBack: (batch: T[]) => any,
    batchSize: number,
    timeout: number
  ): (batch: T[]) => any {
    let timeoutHandler: NodeJS.Timeout;
    let batch: T[] = [];

    function cleanBatch() {
      while (batch.length) {
        callBack(batch.splice(0, batchSize));
      }
      timeoutHandler = setTimeout(cleanBatch, timeout);
    }

    return function(objectList) {
      if (!timeoutHandler) {
        timeoutHandler = setTimeout(cleanBatch, timeout);
      }

      batch.push(...objectList);

      if (batch.length >= batchSize) {
        clearTimeout(timeoutHandler);
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
    const batch: T[] = [];

    const clearBatch = () => {
      while (batch.length) {
        callBack(batch.splice(0, batchSize));
      }
      timeoutHandler = setTimeout(clearBatch, timeout);
    };

    return async generator => {
      timeoutHandler = setTimeout(clearBatch, timeout);

      for await (const obj of generator) {
        batch.push(obj);

        if (batch.length >= batchSize) {
          clearTimeout(timeoutHandler);
          clearBatch();
        }
      }
    };
  }
}
