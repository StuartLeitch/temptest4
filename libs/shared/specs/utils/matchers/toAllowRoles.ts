import {shallowEqual} from 'shallow-equal-object';
import {
  printWithType,
  matcherErrorMessage,
  matcherHint,
  printReceived,
  BOLD_WEIGHT
} from 'jest-matcher-utils';
import * as diff from 'jest-diff';

declare global {
  namespace jest {
    interface Matchers<R> {
      toAllowRoles(a: string[]): R;
    }
  }
}

const formatRoles = (roles: string[]) =>
  roles && roles.length ? `[${roles.join(',')}]` : '[<none>]';

expect.extend({
  toAllowRoles(usecase, expectedRoles) {
    const allowedRoles = (usecase.execute as any).allowedRoles;
    const usecaseName = usecase.constructor.name;

    if (allowedRoles === undefined) {
      return {
        pass: false,
        message: () =>
          matcherErrorMessage(
            matcherHint(
              'toAllowRoles',
              usecaseName,
              formatRoles(expectedRoles)
            ),
            `No roles defined for ${BOLD_WEIGHT(
              usecaseName
            )}.execute(). Did you use the ${BOLD_WEIGHT(
              '@Authorize()'
            )} decorator?`,
            printWithType(
              `${usecaseName}.execute.allowedRoles`,
              allowedRoles,
              printReceived
            )
          )
      };
    }

    allowedRoles.sort();
    expectedRoles.sort();

    if (shallowEqual(expectedRoles, allowedRoles)) {
      return {
        pass: true,
        message: () =>
          `${usecaseName} allows roles ${formatRoles(allowedRoles)}`
      };
    } else {
      return {
        pass: false,
        message: () =>
          matcherErrorMessage(
            matcherHint(
              'toAllowRoles',
              usecaseName,
              formatRoles(expectedRoles)
            ),
            'The roles need to match exactly.',
            diff(expectedRoles, allowedRoles)
          )
      };
    }
  }
});
