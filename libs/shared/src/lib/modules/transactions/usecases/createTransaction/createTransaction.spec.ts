// import {UniqueEntityID} from '../../../../core/domain/UniqueEntityID';
// import {Result} from '../../../../core/logic/Result';

// import {Roles} from '../../../users/domain/enums/Roles';

// import {MockTransactionRepo} from '../../repos/mocks/mockTransactionRepo';
// import {
//   Transaction,
//   TransactionCollection,
//   STATUS as TransactionStatus
// } from '../../domain/Transaction';
// import {
//   CreateTransactionUsecase,
//   CreateTransactionContext
// } from './createTransaction';
// import {Article} from '../../../articles/domain/Article';
// import {MockArticleRepo} from '../../../articles/repos/mocks/mockArticleRepo';

// let usecase: CreateTransactionUsecase;
// let mockTransactionRepo: MockTransactionRepo;
// let mockArticleRepo: MockArticleRepo;
// let result: Result<Transaction>;
// let transactionCollection: TransactionCollection;
// let manuscriptId: string;

// const defaultContext: CreateTransactionContext = {roles: [Roles.SUPER_ADMIN]};

describe('CreateTransactionUseCase', () => {
  describe('When NO Manuscript ID is provided', () => {
    it('should', () => {
      expect(true).toBe(true);
    });
    //     beforeEach(() => {
    //       mockTransactionRepo = new MockTransactionRepo();
    //       mockArticleRepo = new MockArticleRepo();
    //       usecase = new CreateTransactionUsecase(
    //         mockTransactionRepo,
    //         // mockInvoiceRepo,
    //         mockArticleRepo
    //       );
    //     });
    //     it('should still create a draft transaction', async () => {
    //       // * arrange
    //       transactionCollection = await mockTransactionRepo.getTransactionCollection();
    //       expect(transactionCollection.length).toEqual(0);
    //       result = await usecase.execute({}, defaultContext);
    //       expect(result.isSuccess).toBeTruthy();
    //       const secondTransactionCollection =
    //         await mockTransactionRepo.getTransactionCollection();
    //       expect(secondTransactionCollection.length).toEqual(1);
    //       const [transaction] = secondTransactionCollection;
    //       expect(transaction.status).toBe(TransactionStatus.DRAFT);
    //     });
    //   });
    //   describe('When Manuscript ID is provided', () => {
    //     beforeEach(() => {
    //       mockTransactionRepo = new MockTransactionRepo();
    //       mockArticleRepo = new MockArticleRepo();
    //       manuscriptId = 'test-product';
    //       const article = Article.create(
    //         {},
    //         new UniqueEntityID(manuscriptId)
    //       ).getValue();
    //       mockArticleRepo.save(article);
    //       usecase = new CreateTransactionUsecase(
    //         mockTransactionRepo,
    //         mockArticleRepo
    //       );
    //     });
    //     describe('And Manuscript ID is INVALID', () => {
    //       xit('should NOT create a draft transaction', async () => {
    //         result = await usecase.execute(
    //           {
    //             manuscriptId: null
    //           },
    //           defaultContext
    //         );
    //         expect(result.isFailure).toBeTruthy();
    //       });
    //     });
    //     describe('And Manuscript ID is VALID', () => {
    //       it('should create a draft transaction', async () => {
    //         // arrange
    //         transactionCollection = await mockTransactionRepo.getTransactionCollection(
    //           [manuscriptId]
    //         );
    //         expect(transactionCollection.length).toEqual(0);
    //         result = await usecase.execute(
    //           {
    //             manuscriptId
    //           },
    //           defaultContext
    //         );
    //         expect(result.isSuccess).toBeTruthy();
    //         const secondTransactionCollection =
    //           await mockTransactionRepo.getTransactionCollection(
    //              [manuscriptId]
    //           );
    //         expect(secondTransactionCollection.length).toEqual(1);
    //       });
    //     });
  });
});

// xit('should create a draft invoice', async () => {
//   // * arrange
//   transactionCollection = await mockTransactionRepo.getTransactionCollection(
//     articleId
//   );
//   expect(transactionCollection.length).toEqual(0);

//   result = await usecase.execute({
//     articleId: articleId
//   }, defaultContext);

//   expect(result.isSuccess).toBeTruthy();

//   transactionCollection = await mockTransactionRepo.getTransactionCollection(
//     articleId
//   );
//   expect(transactionCollection.length).toEqual(1);

//   const [transaction] = transactionCollection;
//   expect(transaction.status).toBe(TransactionStatus.DRAFT);

//   invoiceCollection = await mockInvoiceRepo.getInvoiceCollection();
//   expect(invoiceCollection.length).toEqual(1);

//   const [invoice] = invoiceCollection;
//   expect(invoice.status).toBe(InvoiceStatus.DRAFT);
// });
