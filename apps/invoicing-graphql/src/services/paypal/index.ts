const checkoutNodeJsSDK = require('@paypal/checkout-server-sdk');

export class PayPalService {
  constructor({
    clientId,
    clientSecret,
    environment
  }: {
    clientId: string;
    clientSecret: string;
    environment: string;
  }) {
    return new checkoutNodeJsSDK.core.PayPalHttpClient(
      this.createEnvironment(clientId, clientSecret, environment)
    );
  }

  createEnvironment(
    clientId: string,
    clientSecret: string,
    environment: string
  ) {
    if (environment === 'live' || environment === 'production') {
      return new checkoutNodeJsSDK.core.LiveEnvironment(clientId, clientSecret);
    } else {
      return new checkoutNodeJsSDK.core.SandboxEnvironment(
        clientId,
        clientSecret
      );
    }
  }
}
