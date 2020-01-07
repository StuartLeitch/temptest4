import * as braintree from 'braintree';
import { environment } from '@env/environment';

let BraintreeGateway: braintree.BraintreeGateway = null;

if (
  !environment.BT_ENVIRONMENT ||
  !environment.BT_MERCHANT_ID ||
  !environment.BT_PUBLIC_KEY ||
  !environment.BT_PRIVATE_KEY
) {
  throw new Error(
    'Cannot find necessary environmental variables. See https://github.com/braintree/braintree_express_example#setup-instructions for instructions'
  );
}

const braintreeEnvironment =
  process.env.BT_ENVIRONMENT.charAt(0).toUpperCase() +
  process.env.BT_ENVIRONMENT.slice(1);

const BraintreeGatewayConfig = {
  environment: braintree.Environment[braintreeEnvironment],
  merchantId: process.env.BT_MERCHANT_ID || environment.BT_MERCHANT_ID,
  publicKey: process.env.BT_PUBLIC_KEY || environment.BT_PUBLIC_KEY,
  privateKey: process.env.BT_PRIVATE_KEY || environment.BT_PRIVATE_KEY
};

// console.log('-------------+  Braintree Gateway Configuration +------------');
// console.info(BraintreeGatewayConfig);
// console.log('-------------------------------------------------------------');

BraintreeGateway = new braintree.BraintreeGateway(BraintreeGatewayConfig);

export { BraintreeGateway };
