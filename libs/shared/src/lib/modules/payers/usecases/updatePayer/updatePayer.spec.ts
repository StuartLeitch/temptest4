import { Result } from '../../../../core/logic/Result';
import { Roles } from '../../../users/domain/enums/Roles';

import { MockPayerRepo } from '../../repos/mocks/mockPayerRepo';
import { Payer, PayerType } from '../../domain/Payer';
import { PayerMap } from '../../mapper/Payer';
import { UpdatePayerUsecase, UpdatePayerContext } from './updatePayer';

let usecase: UpdatePayerUsecase;
let mockPayerRepo: MockPayerRepo;
let result: any;

let payerId: string;

const defaultContext: UpdatePayerContext = { roles: [Roles.SUPER_ADMIN] };

describe('UpdatePayerUsecase', () => {
  describe('When NO Payer ID is provided', () => {
    beforeEach(() => {
      mockPayerRepo = new MockPayerRepo();

      usecase = new UpdatePayerUsecase(mockPayerRepo);
    });

    it('should fail', async () => {
      // * act
      result = await usecase.execute(
        { name: '', email: '', addressId: '' },
        defaultContext
      );

      expect(result.value.isFailure).toBeTruthy();
    });
  });

  describe('When Payer ID is provided', () => {
    beforeEach(() => {
      mockPayerRepo = new MockPayerRepo();

      payerId = 'test-payer';
      const payer = PayerMap.toDomain({
        id: payerId,
        invoiceId: 'invoice-foo',
        name: 'foo',
        type: PayerType.INDIVIDUAL
      });
      mockPayerRepo.save(payer);

      usecase = new UpdatePayerUsecase(mockPayerRepo);
    });

    describe('And Payer ID is INVALID', () => {
      it('should fail', async () => {
        result = await usecase.execute(
          {
            payerId: null,
            name: '',
            addressId: '',
            email: ''
          },
          defaultContext
        );

        expect(result.value.isFailure).toBeTruthy();
      });
    });

    fdescribe('And Payer ID is VALID', () => {
      it('should return the payer details', async () => {
        // arrange
        result = await usecase.execute(
          {
            payerId,
            name: 'boo',
            email: 'foo@bar.com',
            addressId: 'address-foo'
          },
          defaultContext
        );

        expect(result.value.isSuccess).toBeTruthy();
        // expect(
        //   result.getValue().payerId.id.toString() === payerId
        // ).toBeTruthy();
      });
    });

    describe('And type is VALID', () => {
      it('should return the updated payer details', async () => {
        // arrange
        result = await usecase.execute(
          {
            payerId,
            name: 'Foo',
            email: 'foo@bar.com',
            addressId: 'address-foo',
            type: PayerType.INSTITUTION
          },
          defaultContext
        );

        expect(result.isSuccess).toBeTruthy();
        // expect(
        //   result.value.getValue().type === PayerType.INSTITUTION
        // ).toBeTruthy();
      });
    });
  });
});
