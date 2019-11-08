import {Result} from '../../../../core/logic/Result';
import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
import {Roles} from '../../../users/domain/enums/Roles';

import {MockPayerRepo} from '../../repos/mocks/mockPayerRepo';
import {Payer, PayerType} from '../../domain/Payer';
import {PayerName} from '../../domain/PayerName';
import {GetPayerUsecase, GetPayerContext} from './getPayer';

let usecase: GetPayerUsecase;
let mockPayerRepo: MockPayerRepo;
let result: Result<Payer>;

let payerId;

const defaultContext: GetPayerContext = { roles: [Roles.SUPER_ADMIN] };

describe('GetPayerUsecase', () => {
  describe('When NO Payer ID is provided', () => {
    beforeEach(() => {
      mockPayerRepo = new MockPayerRepo();

      usecase = new GetPayerUsecase(mockPayerRepo);
    });

    it('should fail', async () => {
      // * act
      result = await usecase.execute({}, defaultContext);

      expect(result.isFailure).toBeTruthy();
    });
  });

  describe('When Payer ID is provided', () => {
    beforeEach(() => {
      mockPayerRepo = new MockPayerRepo();

      payerId = 'test-payer';
      const payer = Payer.create(
        {
          name: PayerName.create('foo').getValue(),
          type: PayerType.INDIVIDUAL
        },
        new UniqueEntityID(payerId)
      ).getValue();
      mockPayerRepo.save(payer);

      usecase = new GetPayerUsecase(mockPayerRepo);
    });

    describe('And Payer ID is INVALID', () => {
      it('should fail', async () => {
        result = await usecase.execute({
          payerId: null
        }, defaultContext);
        expect(result.isFailure).toBeTruthy();
      });
    });

    describe('And Payer ID is VALID', () => {
      it('should return the payer details', async () => {
        // arrange
        result = await usecase.execute({
          payerId
        }, defaultContext);

        expect(result.isSuccess).toBeTruthy();
        expect(
          result.getValue().payerId.id.toString() === payerId
        ).toBeTruthy();
      });
    });
  });
});
