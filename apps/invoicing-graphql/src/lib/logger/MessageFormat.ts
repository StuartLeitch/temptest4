export class MessageFormat {
  public static formatter(log: any): any {
    const { level, message: messageLog, ...meta } = log;

    const messageFormat = {} as any;

    let scope = '';
    let rawMessage = '';
    const matches = messageLog.match(/\[(.*?)\]\s+(.*)/);
    if (matches) {
      scope = matches[1];
      rawMessage = matches[2];
    }

    const scoping = scope.split(':');

    if (scoping[0] === 'PhenomEvent') {
      messageFormat.eventType = scoping[0];
      messageFormat.eventName = scoping[1];
      messageFormat.message = rawMessage;
    }

    if (scoping[0] === 'Usecase' && scoping[1] === 'Aspect') {
      messageFormat.usecase = meta.usecaseClassName;
      messageFormat.method = meta.usecaseMethodName;

      const { request } = meta;
      const result = meta.args ? meta.args.result : null;

      if (request && Array.isArray(request) && request.length > 0) {
        messageFormat.request = request;
      }

      if (result) {
        messageFormat.result = result;
      }

      delete meta.usecaseClassName;
      delete meta.usecaseMethodName;
    }

    const message = {
      level,
      context: null,
      data: null
    };

    if ('eventType' in messageFormat || 'usecase' in messageFormat) {
      message.context = messageFormat;
    } else {
      message.context = { scope, message: rawMessage };
    }

    // console.info(meta);
    if (meta.correlationId) {
      message.context.correlationId = meta.correlationId;
      delete meta.correlationId;
    }

    if ('request' in messageFormat) {
      message.data = messageFormat.request;
    } else if ('result' in messageFormat) {
      message.data = messageFormat.result;
    } else {
      message.data = meta;
    }

    return JSON.stringify(message);
  }
}
