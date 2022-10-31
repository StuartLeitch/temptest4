import { App, Tenant } from '../../types';

// `import { values as ${env}${invoicingAdmin}Values } from 'apps/${app}/chart/${tenant}/${env}'`

import { values as qaInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/qa';
import { values as qaInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/qa';
import { values as qaInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/qa';
import { values as qaReportingBackendValues } from 'apps/reporting-backend/chart/hindawi/qa';

import { values as demoInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/demo';
import { values as demoInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/demo';
import { values as demoInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/demo';

import { values as demoSalesInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/demo-sales';

import { values as gswDemoInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/gsw/demo';
import { values as gswDemoInvoicingAdminValues } from 'apps/invoicing-admin/chart/gsw/demo';
import { values as gswDemoInvoicingWebValues } from 'apps/invoicing-web/chart/gsw/demo';

import { values as gswProdInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/gsw/prod';
import { values as gswProdInvoicingAdminValues } from 'apps/invoicing-admin/chart/gsw/prod';
import { values as gswProdInvoicingWebValues } from 'apps/invoicing-web/chart/gsw/prod';
// import { values as gswProdReportingValues } from 'apps/reporting-backend/chart/gsw/prod';

import { values as hindawiProdInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/prod';
import { values as hindawiProdInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/prod';
import { values as hindawiProdInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/prod';
import { values as hindawiProdReportingValues } from 'apps/reporting-backend/chart/hindawi/prod';

import { values as automationInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/automation';
import { values as automationInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/automation';
import { values as automationInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/automation';
import { WithSopsSecretsServiceProps } from '@hindawi/phenom-charts/src/lib/Components/charts';

const masterConfig: {
  [tenant: string]: {
    [env: string]: { [app: string]: WithSopsSecretsServiceProps };
  };
} = {
  [Tenant.hindawi]: {
    prod: {
      [App.graphql]: hindawiProdInvoicingGraphqlValues,
      [App.admin]: hindawiProdInvoicingAdminValues,
      [App.web]: hindawiProdInvoicingWebValues,
      [App.reporting]: hindawiProdReportingValues,
    },
    demo: {
      [App.graphql]: demoInvoicingGraphqlValues,
      [App.admin]: demoInvoicingAdminValues,
      [App.web]: demoInvoicingWebValues,
    },
    'demo-sales': {
      [App.graphql]: demoSalesInvoicingGraphqlValues,
      [App.admin]: demoSalesInvoicingAdminValues,
      [App.web]: demoSalesInvoicingWebValues,
    },
    qa: {
      [App.graphql]: qaInvoicingGraphqlValues,
      [App.admin]: qaInvoicingAdminValues,
      [App.web]: qaInvoicingWebValues,
      [App.reporting]: qaReportingBackendValues,
    },
    automation: {
      [App.graphql]: automationInvoicingGraphqlValues,
      [App.admin]: automationInvoicingAdminValues,
      [App.web]: automationInvoicingWebValues,
    },
  },
  [Tenant.gsw]: {
    prod: {
      [App.graphql]: gswProdInvoicingGraphqlValues,
      [App.admin]: gswProdInvoicingAdminValues,
      [App.web]: gswProdInvoicingWebValues,
      // [App.reporting]: gswProdReportingValues,
    },
    demo: {
      [App.graphql]: gswDemoInvoicingGraphqlValues,
      [App.admin]: gswDemoInvoicingAdminValues,
      [App.web]: gswDemoInvoicingWebValues,
    },
  },
};

export { masterConfig };
