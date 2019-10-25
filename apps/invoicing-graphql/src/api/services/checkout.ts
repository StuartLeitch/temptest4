import {Service} from 'typedi';
// import uuid from 'uuid';
// import {OrmRepository} from 'typeorm-typedi-extensions';

import {LoggerContract} from './../../lib/logger/Logger';

import {
  BraintreeGateway,
  PaymentStrategy,
  CreditCardPayment,
  PaymentFactory
} from '@hindawi/shared';

// import {
//   EventDispatcher,
//   EventDispatcherInterface
// } from '../../decorators/EventDispatcher';
// import {Logger, LoggerInterface} from '../../decorators/Logger';
// import {Pet} from '../models/Pet';
// import {User} from '../models/User';
// import {PetRepository} from '../repositories/PetRepository';
// import {events} from '../subscribers/events';

@Service()
export class CheckoutService {
  constructor(
    // @OrmRepository() private petRepository: PetRepository,
    // @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    // @Logger(__filename)
    private log: LoggerContract
  ) {}

  public async pay(payment: any): Promise<any> {
    this.log.info('Create a new payment => ', payment.toString());

    // pet.id = uuid.v1();
    // const newPet = await this.petRepository.save(pet);
    // this.eventDispatcher.dispatch(events.pet.created, newPet);
    // return newPet;

    const paymentFactory: PaymentFactory = new PaymentFactory();
    const paymentStrategy = new PaymentStrategy([
      ['CreditCard', new CreditCardPayment(BraintreeGateway)]
    ]);
    const paymentMethod = paymentFactory.create('CreditCardPayment');

    const braintreePayment: any = await paymentStrategy.makePayment(
      paymentMethod,
      payment.amount
    );

    if (braintreePayment.success) {
      this.log.info('Transaction ID => ' + braintreePayment.transaction.id);
      return braintreePayment.transaction;
    }
  }
}
