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

export class GuardSuccess extends GuardBaseResult {
  readonly succeeded: boolean = true;

  constructor() {
    super();
  }
}

export class GuardFail extends GuardBaseResult {
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

  public static againstEmpty(
    argument: string | Array<unknown> | Record<string, unknown>,
    argumentName: string
  ): GuardResult {
    const nullResult = Guard.againstNullOrUndefined(argument, argumentName);

    if (nullResult.failed) {
      return nullResult;
    }

    if (typeof argument === 'string' && argument === '') {
      return fail(`${argumentName} is an empty string`);
    }

    if (Array.isArray(argument) && argument.length === 0) {
      return fail(`${argumentName} is an empty array`);
    }

    if (typeof argument === 'object' && Object.keys(argument).length === 0) {
      return fail(`${argumentName} is an empty object`);
    }

    return success();
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
      /* eslint-disable-next-line no-useless-escape */
      /^(([^<>()\[\]\\.,;:\s@"“”]+(\.[^<>()\[\]\\.,;:\s@"“”]+)*))@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/i
    );

    if (emailRegex.test(email)) {
      return success();
    }

    return fail(`${email} is an invalid email address.`);
  }

  public static againstInvalidIssn(issn: string): GuardResult {
    const issnRegex = /^[0-9]{4}-[0-9]{3}[0-9xX]$/;

    if (!issnRegex.test(issn)) {
      return fail(`${issn} is an invalid ISSN`);
    }

    if (isIssnCheckSumValid(issn)) {
      return success();
    }

    return fail(`${issn} is an invalid ISSN`);
  }
}

function getCheckDigitValue(issn: string): number {
  const d = issn[issn.length - 1];

  if (d === 'x' || d === 'X') {
    return 10;
  }

  return Number.parseInt(d, 10);
}

function isIssnCheckSumValid(issn: string): boolean {
  const onlyDigits = `${issn}`.replace('-', '');
  const withoutCheckDigit = onlyDigits.substring(0, 7);
  const checkDigit = getCheckDigitValue(onlyDigits);

  const sum = withoutCheckDigit
    .split('')
    .map((n) => Number.parseInt(n, 10))
    .reduce((acc, num, index) => {
      return acc + num * (8 - index);
    }, 0);

  const remainder = sum % 11;

  if (remainder === 0 && checkDigit === 0) {
    return true;
  }

  if (11 - remainder === checkDigit) {
    return true;
  }

  return false;
}
