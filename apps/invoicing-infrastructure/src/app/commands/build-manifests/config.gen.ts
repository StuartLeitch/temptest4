// TODO generate this based on apps folder structure
import { App, Tenant } from '../../types';
import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';

// `import { values as ${env}${invoicingAdmin}Values } from 'apps/${app}/chart/${tenant}/${env}'`
import { values as devInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/dev';

const masterConfig: {
  [app: string]: {
    [tenant: string]: { [env: string]: WithAwsSecretsServiceProps };
  };
} = {
  [App.admin]: {
    [Tenant.hindawi]: {
      dev: devInvoicingAdminValues,
    },
  },
};

export { masterConfig };
