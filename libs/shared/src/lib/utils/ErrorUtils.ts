import { LoggerContract } from './../infrastructure/logging';

export class ErrorUtils {
  public static handleErpErrors(
    errs: any[],
    loggerService: LoggerContract
  ): void {
    errs.forEach((err) => {
      if (typeof err === 'object' && err?.isAxiosError) {
        const errOut = {
          message: '',
          name: '',
          stack: '',
          config: '',
          details: '',
        };
        const errJSON = err.toJSON();
        if ('message' in errJSON) {
          errOut.message = errJSON.message;
        }
        if ('name' in errJSON) {
          errOut.name = errJSON.name;
        }
        if ('stack' in errJSON) {
          errOut.stack = errJSON.stack;
        }
        if ('config' in errJSON) {
          errOut.config = errJSON.config;
        }
        const details = err.response.data['o:errorDetails'];
        errOut.details = details;

        loggerService.error(errOut.message, errOut);
      } else {
        loggerService.error(err.error, err);
      }
    });
  }
}
