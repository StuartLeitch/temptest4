import {Body, JsonController, Post} from 'routing-controllers';

@JsonController()
export class PaypalController {
  @Post('/paypal-payment-created')
  public paymentCreated(@Body() payment: any) {
    console.log('-------- PAYMENT CREATED CTRL -------- ');
    console.log(payment);
    return Promise.resolve(42);
  }

  @Post('/paypal-payment-completed')
  public paymentComplete(@Body() payment: any): any {
    console.log('-------- PAYMENT COMPLETE CTRL -------- ');
    console.log(payment);
    return Promise.resolve(42);
  }
}
