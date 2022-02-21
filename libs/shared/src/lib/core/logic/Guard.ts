abstract class GuardBaseResult {
  readonly succeeded: boolean;
  readonly message?: string;

  get failed(): boolean {
    return !this.succeeded;
  }

  combine(other: GuardResult): GuardResult {
    if (this.failed) {
      return this;
    }

    return other;
  }

  isSuccess(): this is GuardSuccess {
    return this.succeeded;
  }

  isFail(): this is GuardFail {
    return this.failed;
  }
}

class GuardSuccess extends GuardBaseResult {
  readonly succeeded: boolean = true;

  constructor() {
    super();
  }
}

class GuardFail extends GuardBaseResult {
  readonly succeeded: boolean = false;

  constructor(public readonly message: string) {
    super();
    if (!message) {
      throw new Error('Message is required for failed guards');
    }
  }
}

type GuardResult = GuardSuccess | GuardFail;

function success() {
  return new GuardSuccess();
}

function fail(message: string) {
  return new GuardFail(message);
}

export interface GuardArgument {
  argumentName: string;
  argument: unknown;
}

export type GuardArgumentCollection = GuardArgument[];

export class Guard {
  public static combineResults(guardResults: GuardResult[]): GuardResult {
    for (const result of guardResults) {
      if (result.isFail()) {
        return result;
      }
    }

    return success();
  }

  public static greaterThan(
    minValue: number,
    actualValue: number
  ): GuardResult {
    if (actualValue > minValue) {
      return success();
    } else {
      const msg = `Number given {${actualValue}} is not greater than {${minValue}}`;
      return fail(msg);
    }
  }

  public static againstNullOrUndefined(
    argument: unknown,
    argumentName: string
  ): GuardResult {
    if (argument === null || argument === undefined) {
      return fail(`${argumentName} is null or undefined`);
    } else {
      return success();
    }
  }

  public static againstAtLeast(numChars: number, text: string): GuardResult {
    if (text.length >= numChars) {
      return success();
    } else {
      return fail(`Text is not at least ${numChars} chars.`);
    }
  }

  public static againstAtMost(numChars: number, text: string): GuardResult {
    if (text.length <= numChars) {
      return success();
    } else {
      return fail(`Text is greater than ${numChars} chars.`);
    }
  }

  public static againstNullOrUndefinedBulk(
    args: GuardArgumentCollection
  ): GuardResult {
    for (const arg of args) {
      const result = this.againstNullOrUndefined(
        arg.argument,
        arg.argumentName
      );
      if (!result.succeeded) {
        return result;
      }
    }

    return success();
  }

  public static isOneOf(
    value: unknown,
    validValues: Array<unknown>,
    argumentName: string
  ): GuardResult {
    for (const validValue of validValues) {
      if (value === validValue) {
        return success();
      }
    }

    const msg = `${argumentName} isn't oneOf the correct types in ${JSON.stringify(
      validValues
    )}. Got "${value}".`;

    return fail(msg);
  }

  public static inRange(
    num: number,
    min: number,
    max: number,
    argumentName: string
  ): GuardResult {
    const isInRange = num >= min && num <= max;
    if (isInRange) {
      return success();
    } else {
      return fail(`${argumentName} is not within range ${min} to ${max}.`);
    }
  }

  public static allInRange(
    numbers: number[],
    min: number,
    max: number,
    argumentName: string
  ): GuardResult {
    let failingResult: GuardResult;
    for (const num of numbers) {
      const numIsInRangeResult = this.inRange(num, min, max, argumentName);
      if (!numIsInRangeResult.succeeded) {
        failingResult = numIsInRangeResult;
      }
    }

    if (failingResult) {
      return fail(`${argumentName} is not within the range.`);
    } else {
      return success();
    }
  }

  public static againstInvalidEmail(email: string): GuardResult {
    const emailRegex = new RegExp(
      /^(([^<>()\[\]\\.,;:\s@"“”]+(\.[^<>()\[\]\\.,;:\s@"“”]+)*))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/i
    );

    if (emailRegex.test(email)) {
      return success();
    }

    return fail(`${email} is an invalid email address.`);
  }
}
