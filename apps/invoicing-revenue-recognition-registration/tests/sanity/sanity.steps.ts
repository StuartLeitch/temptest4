/* eslint-disable @nrwl/nx/enforce-module-boundaries */

import { expect } from 'chai';
import { Then } from '@cucumber/cucumber';

Then(/^True = True$/, async () => {
  expect(true).equals(true);
});
