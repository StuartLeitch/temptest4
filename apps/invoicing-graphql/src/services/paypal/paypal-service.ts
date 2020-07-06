import * as checkoutNodeJsSDK from '@paypal/checkout-server-sdk';

import { PayPalEnvironment, PayPalHttpClient, PayPalRequest } from './types';

export interface PayPalServiceData {
  clientSecret: string;
  environment: string;
  clientId: string;
}

export class PayPalService implements PayPalHttpClient {
  private httpClient: PayPalHttpClient;

  constructor(connData: PayPalServiceData) {
    this.httpClient = new checkoutNodeJsSDK.core.PayPalHttpClient(
      this.createEnvironment(connData)
    );
  }

  private createEnvironment({
    clientId,
    clientSecret,
    environment,
  }: PayPalServiceData): PayPalEnvironment {
    if (environment === 'live' || environment === 'production') {
      return new checkoutNodeJsSDK.core.LiveEnvironment(clientId, clientSecret);
    } else {
      return new checkoutNodeJsSDK.core.SandboxEnvironment(
        clientId,
        clientSecret
      );
    }
  }

  async execute(request: PayPalRequest): Promise<any> {
    return this.httpClient.execute(request);
  }

  fetchAccessToken(): Promise<any> {
    return this.httpClient.fetchAccessToken();
  }

  getTimeout(): number {
    return this.httpClient.getTimeout();
  }

  getUserAgent(): string {
    return this.httpClient.getUserAgent();
  }
}
