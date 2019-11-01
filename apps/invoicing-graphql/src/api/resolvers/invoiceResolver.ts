// import DataLoader from 'dataloader';
import { Arg, Ctx, FieldResolver, Mutation, Query, Resolver, Root } from 'type-graphql';
import { Service } from 'typedi';

// import { DLoader } from '../../decorators/DLoader';
import { Logger, LoggerContract} from '../../decorators/Logger';
import { Context } from '../Context';
import { Invoice } from '@hindawi/shared';
import { InvoiceService } from '../services/invoice';
import { InvoiceInput } from '../types/input/invoice';
import { InvoiceType } from '../types/Invoice';

@Service()
@Resolver(of => InvoiceType)
export class InvoiceResolver {
    constructor(
        private invoiceService: InvoiceService,
        @Logger(__filename) private log: LoggerContract,
        // @DLoader(Invoice) private invoiceLoader: DataLoader<string, Invoice>
    ) { }

    @Query(returns => [Invoice])
    public invoices(@Ctx() { requestId }: Context): Promise<Invoice[]> {
        this.log.info(`{${requestId}} Find all invoices`);
        return this.invoiceService.find();
    }

    @Mutation(returns => Invoice)
    public async addInvoice(@Arg('invoice') invoice: InvoiceInput): Promise<Invoice> {
      return null;
        // const newInvoice = InvoiceMap.toDomain({

        // });
        // newInvoice.name = invoice.name;
        // newInvoice.id = invoice.id;
        // return this.invoiceService.create(newInvoice);
    }

    @FieldResolver()
    public async owner(@Root() invoice: Invoice): Promise<any> {
        // if (invoice.userId) {
        //     return this.userLoader.load(invoice.userId);
        // }
        // return this.userService.findOne(`${invoice.userId}`);
    }

    // user: createDataLoader(UserRepository),

    //     petsByUserIds: createDataLoader(PetRepository, {
    //         method: 'findByUserIds',
    //         key: 'userId',
    //         multiple: true,
    //     }),

}

// import {
//   GetInvoiceDetailsRequestDTO,
//   GetInvoiceDetailsUsecase,
//   DeleteInvoiceUsecase,
//   DeleteInvoiceRequestDTO,
//   CreateInvoiceUsecase,
//   CreateInvoiceRequestDTO,
//   InvoiceMap
// } from '@hindawi/shared';

// import {Resolvers} from '../schema';
// import {Context} from '../context';

// export const invoice: Resolvers<Context> = {
//   Query: {
//     async invoice(parent, args, context, info) {
//       const {repos} = context;
//       const usecase = new GetInvoiceDetailsUsecase(repos.invoice);

//       const request: GetInvoiceDetailsRequestDTO = {
//         invoiceId: args.id
//       };

//       const result = await usecase.execute(request);

//       if (!result.isSuccess) {
//         return undefined;
//       }

//       const invoice = result.getValue();

//       return {
//         id: invoice.id.toString(),
//         invoice
//         // totalAmount: invoice.totalAmount,
//         // netAmount: invoice.netAmount
//       };
//     }
//   },

//   Mutation: {
//     async deleteInvoice(parent, args, context) {
//       const {repos} = context;
//       const usecase = new DeleteInvoiceUsecase(repos.invoice);

//       const request: DeleteInvoiceRequestDTO = {
//         invoiceId: args.id
//       };

//       const result = await usecase.execute(request);

//       return result.isSuccess;
//     },

//     async createInvoice(parent, args, context) {
//       const {repos} = context;
//       const usecase = new CreateInvoiceUsecase(
//         repos.invoice,
//         repos.transaction
//       );

//       const request: CreateInvoiceRequestDTO = {
//         transactionId: 'transaction-1'
//       };

//       const result = await usecase.execute(request);

//       return InvoiceMap.toPersistence(result.getValue());
//     }
//   }
// };
