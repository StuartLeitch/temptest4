export class BatchUtils {
  public static withTimeout<T>(
    callBack: (batch: T[]) => any,
    batchSize: number,
    timeout: number
  ): (batch: T[]) => any {
    let intervalHandler: NodeJS.Timeout;
    let batch: T[] = [];

    function cleanBatch() {
      while (batch.length) {
        callBack(batch.splice(0, batchSize));
      }
    }

    return function(objectList) {
      if (!intervalHandler) {
        intervalHandler = setInterval(cleanBatch, timeout);
      }

      batch.push(...objectList);

      if (batch.length >= batchSize) {
        clearInterval(intervalHandler);
        cleanBatch();
        intervalHandler = setInterval(cleanBatch, timeout);
      }
    };
  }

  public static generatorWithTimeout<T, U = void>(
    callBack: (batch: T[]) => U,
    batchSize: number,
    timeout: number
  ): (generator: AsyncGenerator<T, any, unknown>) => Promise<void> {
    return async generator => {
      let intervalHandler: NodeJS.Timeout;
      const batch: T[] = [];

      function clearBatch() {
        while (batch.length) {
          callBack(batch.splice(0, batchSize));
        }
      }

      intervalHandler = setInterval(clearBatch, timeout);

      for await (const obj of generator) {
        batch.push(obj);

        if (batch.length >= batchSize) {
          clearInterval(intervalHandler);
          clearBatch();
          intervalHandler = setInterval(clearBatch, timeout);
        }
      }

      clearInterval(intervalHandler);
      clearBatch();
    };
  }
}
