import {
  PaymentStrategy,
  CreditCardPayment,
  PaymentFactory,
  CreditCard
} from '@hindawi/shared';
// tslint:disable-next-line
import {BraintreeGateway} from '@hindawi/shared';

export class CheckoutService {
  public async pay(payment: any): Promise<any> {
    console.log('Create a new payment => ', payment);

    // pet.id = uuid.v1();
    // const newPet = await this.petRepository.save(pet);
    // this.eventDispatcher.dispatch(events.pet.created, newPet);
    // return newPet;

    const paymentFactory: PaymentFactory = new PaymentFactory();
    const creditCard = new CreditCard();
    paymentFactory.registerPayment(creditCard);
    const paymentMethod = paymentFactory.create('CreditCardPayment');
    const paymentStrategy = new PaymentStrategy([
      ['CreditCard', new CreditCardPayment(BraintreeGateway)]
    ]);

    const braintreePayment: any = await paymentStrategy.makePayment(
      paymentMethod,
      payment.amount
    );

    if (braintreePayment.success) {
      console.log('Transaction ID => ' + braintreePayment.transaction.id);
      return braintreePayment.transaction;
    }
  }
}
