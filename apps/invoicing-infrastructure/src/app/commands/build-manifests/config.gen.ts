// TODO generate this based on apps folder structure
import { App, Tenant } from '../../types';
import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';

// `import { values as ${env}${invoicingAdmin}Values } from 'apps/${app}/chart/${tenant}/${env}'`
import { values as devInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/dev';
import { values as devInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/dev';
import { values as devInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/dev';
import { values as devReportingBackendValues } from 'apps/reporting-backend/chart/hindawi/dev';

const masterConfig: {
  [tenant: string]: {
    [env: string]: { [app: string]: WithAwsSecretsServiceProps };
  };
} = {
  [Tenant.hindawi]: {
    dev: {
      [App.admin]: devInvoicingAdminValues,
      [App.graphql]: devInvoicingGraphqlValues,
      [App.web]: devInvoicingWebValues,
      [App.reporting]: devReportingBackendValues,
    },
  },
};

export { masterConfig };
