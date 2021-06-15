import { Either, right, left } from '../core/logic/Either';

type ParseDataType = 'number' | 'string' | 'object';
type EventName = [string, string?];

class ParseArrayConfig {
  private raw: any;

  constructor(raw: any) {
    this.raw = raw;
  }

  public to(dataType: ParseDataType): any[] {
    switch (dataType) {
      case 'number':
        return JSON.parse(this.raw) as number[];
      case 'string':
        return JSON.parse(this.raw) as string[];
      case 'object':
        return JSON.parse(this.raw) as object[];
    }
  }
}

export class ParseUtils {
  public static parseBoolean(raw: any): boolean {
    if (raw === '' || raw === undefined || raw === null || raw === 'null')
      return false;
    return JSON.parse(raw);
  }

  public static parseObject(raw: any): Either<Error, any> {
    let returnData: any;
    try {
      returnData = JSON.parse(raw);
    } catch (err) {
      return left(err);
    }

    return right(returnData);
  }

  public static parseArray(rawArrayString: any): ParseArrayConfig {
    return new ParseArrayConfig(rawArrayString);
  }

  public static parseEvent(name: string): EventName {
    const [
      m /* aka. 'matched string' */,
      ...captures
    ] = /^\s*(\S+?)(?:\.(\S+))?\s*$/.exec(name);
    return captures as EventName;
  }

  public static parseRefNumber(value: string) {
    const [m, ...captures] = /^\s*0*(\d+)\/(\d+)\s*$/.exec(value);
    return captures;
  }
}
