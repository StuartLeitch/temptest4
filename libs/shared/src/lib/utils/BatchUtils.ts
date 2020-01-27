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
}
