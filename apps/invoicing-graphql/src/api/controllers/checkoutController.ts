import {
  // Authorized,
  Body,
  // Delete,
  Get,
  JsonController,
  // OnUndefined,
  // Param,
  Post
  // Put
} from 'routing-controllers';


import {CheckoutService} from '../services/checkout';

// @Authorized()
@JsonController('/checkout')
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Get()
  public hello(): Promise<any> {
    return Promise.resolve({lastone: 'Hello World!'});
  }

  @Post()
  public create(@Body() payment: any): Promise<any> {
    return this.checkoutService.pay(payment);
  }
}
