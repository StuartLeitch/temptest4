import {defineFeature, loadFeature} from 'jest-cucumber';

import {Result} from '../../lib/core/logic/Result';
import {UniqueEntityID} from '../../lib/core/domain/UniqueEntityID';

import {PaymentMethod} from '../../lib/modules/payments/domain/PaymentMethod';
import {EnablePaymentMethodUsecase} from '../../lib/modules/payments/usecases/enablePaymentMethod/enablePaymentMethod';
import {MockPaymentMethodRepo} from '../../lib/modules/payments/repos/mocks/mockPaymentMethodRepo';

import {User} from '../../lib/modules/users/domain/User';
import {UserEmail} from '../../lib/modules/users/domain/UserEmail';
import {UserPassword} from '../../lib/modules/users/domain/UserPassword';
import {Roles} from '../../lib/modules/users/domain/enums/Roles';

const feature = loadFeature(
  './specs/features/payment-methods-configuration.feature'
);

defineFeature(feature, test => {
  let mockPaymentMethodRepo: MockPaymentMethodRepo = new MockPaymentMethodRepo();

  let result: Result<PaymentMethod>;

  let userId: string;
  // let adminId;
  let user: User;
  let paymentMethodId: string;

  let usecase: EnablePaymentMethodUsecase = new EnablePaymentMethodUsecase(
    mockPaymentMethodRepo
  );

  beforeEach(() => {
    userId = 'test-user';
    user = User.create(
      {
        email: UserEmail.create('foo').getValue(),
        password: UserPassword.create({
          value: 'F00b@rMoz',
          hashed: false
        }).getValue()
      },
      new UniqueEntityID(userId)
    ).getValue();
    // mockPayerRepo.save(payer);

    paymentMethodId = 'test-payment-method-cc';
    let paymentMethod = PaymentMethod.create(
      {
        name: 'CreditCardPaymentMethod',
        isActive: false
      },
      new UniqueEntityID(paymentMethodId)
    ).getValue();
    mockPaymentMethodRepo.save(paymentMethod);
  });

  test('Configure a payment method as Customer', ({given, when, then}) => {
    given('I am Customer', () => {
      user.setRole(Roles.CUSTOMER);
    });

    when('I try to configure payment methods', async () => {
      result = await usecase.execute(
        {
          paymentMethodId,
          toggle: false
        },
        {
          roles: [user.role]
        }
      );
    });

    then('I should not be allowed', () => {
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe('UnauthorizedUserException');
    });
  });

  test('Configure a payment method as Admin', ({given, when, then}) => {
    given('I am Admin', () => {
      user.setRole(Roles.ADMIN);
    });

    when('I try to configure payment methods', async () => {
      result = await usecase.execute(
        {
          paymentMethodId,
          toggle: false
        },
        {
          roles: [user.role]
        }
      );
    });

    then('I should be allowed', () => {
      expect(result.isSuccess).toBe(true);
    });
  });

  test('Set a payment method as active', ({given, when, then}) => {
    given('I am Admin', () => {
      user.setRole(Roles.ADMIN);
    });

    when('I try to set a payment method as active', async () => {
      result = await usecase.execute(
        {
          paymentMethodId,
          toggle: true
        },
        {
          roles: [user.role]
        }
      );
    });

    then('The PaymentMethod should appear as available', () => {
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isActive).toBeTruthy();
    });
  });
  test('Set a payment method as inactive', ({given, when, then}) => {
    given('I am Admin', () => {
      user.setRole(Roles.ADMIN);
    });

    when('I try to set a payment method as inactive', async () => {
      result = await usecase.execute(
        {
          paymentMethodId,
          toggle: false
        },
        {
          roles: [user.role]
        }
      );
    });

    then('The PaymentMethod should not appear as available', () => {
      expect(result.isSuccess).toBe(true);
      expect(result.getValue().isActive).toBeFalsy();
    });
  });
});
