export class BatchUtils {
  public static withTimeout<T>(
    callBack: (batch: T[]) => void,
    batchSize: number,
    timeout: number
  ): (batch: T[]) => void {
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
