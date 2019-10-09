import * as braintree from 'braintree';

let environment = '';
let BraintreeGateway: braintree.BraintreeGateway = null;

require('dotenv').config();

if (
  !process.env.BT_ENVIRONMENT ||
  !process.env.BT_MERCHANT_ID ||
  !process.env.BT_PUBLIC_KEY ||
  !process.env.BT_PRIVATE_KEY
) {
  throw new Error(
    'Cannot find necessary environmental variables. See https://github.com/braintree/braintree_express_example#setup-instructions for instructions'
  );
}

environment =
  process.env.BT_ENVIRONMENT.charAt(0).toUpperCase() +
  process.env.BT_ENVIRONMENT.slice(1);

BraintreeGateway = new braintree.BraintreeGateway({
  environment: braintree.Environment[environment],
  merchantId: process.env.BT_MERCHANT_ID,
  publicKey: process.env.BT_PUBLIC_KEY,
  privateKey: process.env.BT_PRIVATE_KEY
});

export {BraintreeGateway};
