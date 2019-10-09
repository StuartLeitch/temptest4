class AWSError extends Error {
  constructor(message) {
    super(message);
    this.message = message;
  }
}

export class MissingRequiredParameterError extends AWSError {
  constructor(param) {
    const message = `Missing required parameter '${param}' in params`;
    super(message);
    this.name = 'MissingRequiredParameter';
    this.message = message;
  }
}

export class MultipleValidationErrors extends AWSError {
  constructor(errors) {
    const message = combineErrorMessages(errors);
    super(message);
    this.name = 'MultipleValidationErrors';
    this.message = message;

    function combineErrorMessages(errors) {
      let msg = `There were ${errors.length} validation errors: \n`;
      errors.forEach(error => {
        msg += `* ${error.message} \n`;
      });
      return msg;
    }
  }
}

export class QueueDoesNotExistError extends AWSError {
  constructor() {
    const message = 'The queue referred to does not exist';
    super(message);
    this.name = 'QueueDoesNotExist';
    this.message = message;
  }
}

export class InvalidAttributeNameError extends AWSError {
  constructor() {
    const message = 'The attribute referred to does not exist';
    super(message);
    this.name = 'InvalidAttributeName';
    this.message = message;
  }
}

export class InvalidParameterTypeError extends AWSError {
  constructor(accessor, type) {
    const message = `Expected params.${accessor} to be a ${type}`;
    super(message);
    this.name = 'InvalidParameterType';
    this.message = message;
  }
}

export class InvalidParameterValueError extends AWSError {
  constructor(value, msg) {
    const message = `Value ${value} is invalid. Reason: ${msg}.`;
    super(message);
    this.name = 'InvalidParameterValue';
    this.message = message;
  }
}
