export const environment = {
  BT_ENVIRONMENT: 'sandbox',
  BT_MERCHANT_ID: 'add-bt-merchant-id',
  BT_PUBLIC_KEY: 'add-bt-public-key',
  BT_PRIVATE_KEY: 'add-bt-private-key',

  VAT_VALIDATION_SERVICE_ENDPOINT:
    'http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl',

  EVENT_NAMESPACE: 'pen',
  PUBLISHER_NAME: 'hindawi',
  SERVICE_NAME: 'invoicing',
  AWS_SNS_SQS_REGION: 'eu-west-1',
  AWS_SNS_TOPIC: 'test1',
  AWS_SNS_ENDPOINT: 'https://sns.eu-west-1.amazonaws.com/496598730381/test1',
  AWS_SQS_ENDPOINT:
    'https://sqs.eu-west-1.amazonaws.com/496598730381/invoicing-dev',
  AWS_SQS_QUEUE_NAME: 'invoicing-dev',

  DB_HOST: 'aaqq6wxw5rhdo4.caews8gzu4su.eu-west-1.rds.amazonaws.com',
  DB_USERNAME: 'invoicingSandbox',
  DB_PASSWORD: 'invoicingDevelopment',
  DB_DATABASE: 'ebdb',
  DB_MIGRATIONS_DIR:
    '../../../libs/shared/src/lib/infrastructure/database/knex/migrations'
};
