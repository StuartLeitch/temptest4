import {Body, Get, JsonController, Post} from 'routing-controllers';

import {CheckoutService} from '../services/checkout';

// @Authorized()
@JsonController('/checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Get()
  public hello(): Promise<any> {
    return Promise.resolve({faceem: 'Hello World!'});
  }

  @Post()
  public create(@Body() payment: any): Promise<any> {
    return this.checkoutService.pay(payment);
  }
}
