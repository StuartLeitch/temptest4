import {getGreeting} from '../support/app.po';

describe('invoicing-web', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to invoicing-web!');
  });
});
