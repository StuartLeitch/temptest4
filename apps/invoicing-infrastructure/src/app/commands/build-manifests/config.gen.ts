import { App, Tenant } from '../../types';
import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';

// `import { values as ${env}${invoicingAdmin}Values } from 'apps/${app}/chart/${tenant}/${env}'`

import { values as qaImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/qa';
import { values as qaImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/qa';
import { values as qaImportManuscriptWeb } from 'apps/import-manuscript-web/chart/hindawi/qa';
import { values as qaInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/qa';
import { values as qaInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/qa';
import { values as qaInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/qa';
// import { values as qaReportingBackendValues } from 'apps/reporting-backend/chart/hindawi/qa';

import { values as demoInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/demo';
import { values as demoInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/demo';
import { values as demoInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/demo';
// import { values as demoImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/demo';
// import { values as demoImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/demo';
// import { values as demoImportManuscriptWeb } from 'apps/import-manuscript-web/chart/hindawi/demo';

import { values as demoSalesInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/demo-sales';
// import { values as demoSalesImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/demo-sales';
// import { values as demoSalesImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/demo-sales';
// import { values as demoSalesImportManuscriptWeb } from 'apps/import-manuscript-web/chart/hindawi/demo-sales';

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
// import { values as hindawiProdImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/prod';
// import { values as hindawiProdImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/prod';
// import { values as hindawiProdImportManuscriptWeb } from 'apps/import-manuscript-web/chart/hindawi/prod';
// import { values as hindawiProdReportingValues } from 'apps/reporting-backend/chart/hindawi/prod';

import { values as automationInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/automation';
import { values as automationInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/automation';
import { values as automationInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/automation';
// import { values as automationImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/automation';
// import { values as automationImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/automation';
// import { values as automationImportManuscriptWeb } from 'apps/import-manuscript-web/chart/hindawi/automation';

const masterConfig: {
  [tenant: string]: {
    [env: string]: { [app: string]: WithAwsSecretsServiceProps };
  };
} = {
  [Tenant.hindawi]: {
    prod: {
      [App.graphql]: hindawiProdInvoicingGraphqlValues,
      [App.admin]: hindawiProdInvoicingAdminValues,
      [App.web]: hindawiProdInvoicingWebValues,
      // [App.importManuscriptValidation]: hindawiProdImportManuscriptValidation,
      // [App.importManuscriptBackend]: hindawiProdImportManuscriptBackend,
      // [App.importManuscriptWeb]: hindawiProdImportManuscriptWeb,,
      // [App.reporting]: hindawiProdReportingValues,
    },
    demo: {
      [App.graphql]: demoInvoicingGraphqlValues,
      [App.admin]: demoInvoicingAdminValues,
      [App.web]: demoInvoicingWebValues,
      // [App.importManuscriptValidation]: demoImportManuscriptValidation,
      // [App.importManuscriptBackend]: demoImportManuscriptBackend,
      // [App.importManuscriptWeb]: demoImportManuscriptWeb,
    },
    'demo-sales': {
      [App.graphql]: demoSalesInvoicingGraphqlValues,
      [App.admin]: demoSalesInvoicingAdminValues,
      [App.web]: demoSalesInvoicingWebValues,
      // [App.importManuscriptValidation]: demoSalesImportManuscriptValidation,
      // [App.importManuscriptBackend]: demoSalesImportManuscriptBackend,
      // [App.importManuscriptWeb]: demoSalesImportManuscriptWeb,
    },
    qa: {
      [App.graphql]: qaInvoicingGraphqlValues,
      [App.admin]: qaInvoicingAdminValues,
      [App.web]: qaInvoicingWebValues,
      [App.importManuscriptValidation]: qaImportManuscriptValidation,
      [App.importManuscriptBackend]: qaImportManuscriptBackend,
      [App.importManuscriptWeb]: qaImportManuscriptWeb,
      // [App.reporting]: qaReportingBackendValues,
    },
    automation: {
      [App.graphql]: automationInvoicingGraphqlValues,
      [App.admin]: automationInvoicingAdminValues,
      [App.web]: automationInvoicingWebValues,
      // [App.importManuscriptValidation]: automationImportManuscriptValidation,
      // [App.importManuscriptBackend]: automationImportManuscriptBackend,
      // [App.importManuscriptWeb]: automationImportManuscriptWeb,
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
