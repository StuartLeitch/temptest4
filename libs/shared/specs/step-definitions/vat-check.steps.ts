import {defineFeature, loadFeature} from 'jest-cucumber';

// import {Result} from '../../src/lib/core/logic/Result';
// import {UniqueEntityID} from '../../lib/core/domain/UniqueEntityID';
import {
  ValidateVATContext,
  ValidateVATUsecase
} from './../../src/lib/modules/invoices/usecases/validateVAT/validateVAT';
import {ValidateVATErrors} from './../../src/lib/modules/invoices/usecases/validateVAT/validateVATErrors';
import {VATService} from './../../src/lib/modules/invoices/domain/services/VATService';

import {Roles} from './../../src/lib/modules/users/domain/enums/Roles';

const feature = loadFeature('../features/vat-check.feature', {
  loadRelativePath: true
});

const defaultContext: ValidateVATContext = {roles: [Roles.SUPER_ADMIN]};

defineFeature(feature, test => {
  let vatService: VATService = new VATService();
  let validateVATUsecase = new ValidateVATUsecase(vatService);
  let countryCode: string;
  let VATNumber: string;
  let result: any;
  let vatResponse: any;

  test('Valid VAT Check', ({given, when, and, then}) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and(/^The Payer VAT number is (\w+)$/, (vatNumber: string) => {
      VATNumber = vatNumber;
    });

    when('The VAT number is checked', async () => {
      result = await validateVATUsecase.execute(
        {
          countryCode,
          vatNumber: VATNumber
        },
        defaultContext
      );

      vatResponse = result.value.getValue();
    });

    then('The VAT should be valid', async () => {
      const {valid} = vatResponse;
      expect(valid).toBe(true);
    });
  });

  test('Invalid VAT Check', ({given, when, and, then}) => {
    given(/^The Payer is in (\w+)$/, (country: string) => {
      countryCode = country;
    });

    and(/^The Payer VAT number is (\w+)$/, (vatNumber: string) => {
      VATNumber = vatNumber;
    });

    when('The VAT number is checked', async () => {
      result = await validateVATUsecase.execute(
        {
          countryCode,
          vatNumber: VATNumber
        },
        defaultContext
      );

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor.name) {
          case ValidateVATErrors.InvalidInputError.name:
            vatResponse = error.errorValue();
        }
      }
    });

    then('The VAT should be invalid', async () => {
      const {message} = vatResponse;
      expect(message).toBe(
        `Invalid Input for {${VATNumber} or ${countryCode}}.`
      );
    });
  });
});
