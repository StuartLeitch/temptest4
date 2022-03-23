import { When, Then } from '@cucumber/cucumber';
import { expect } from 'chai';

import { GuardFail } from '@hindawi/shared';

import { Issn, IssnType } from '../../../../src/lib/models';

let result: Issn | GuardFail = null;

When('I create a new ISSN with code {string}', (code: string) => {
  try {
    result = Issn.create({
      type: IssnType.ISSN,
      value: code,
    });
  } catch (err) {
    result = err;
  }
});

Then('the ISSN is created successfully', () => {
  expect(result).to.be.instanceOf(Issn);
});

Then('a guard error is generated', () => {
  expect(result).to.be.instanceOf(GuardFail);
});
