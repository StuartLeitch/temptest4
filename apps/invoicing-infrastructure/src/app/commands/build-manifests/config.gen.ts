// TODO generate this based on apps folder structure
import { App, Tenant } from '../../types';
import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';

// `import { values as ${env}${invoicingAdmin}Values } from 'apps/${app}/chart/${tenant}/${env}'`
import { values as devInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/dev';
import { values as devInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/dev';
import { values as devInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/dev';
import { values as devReportingBackendValues } from 'apps/reporting-backend/chart/hindawi/dev';
import { values as devInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/dev';
import { values as devImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/dev';
import { values as devImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/dev';

import { values as qaInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/qa';
import { values as qaInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/qa';
import { values as qaInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/qa';
import { values as qaReportingBackendValues } from 'apps/reporting-backend/chart/hindawi/qa';
import { values as qaInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/qa';
import { values as qaImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/qa';
import { values as qaImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/qa';

import { values as demoInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/demo';
import { values as demoInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/demo';
import { values as demoInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/demo';
import { values as demoInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/demo';
import { values as demoImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/demo';
import { values as demoImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/demo';

import { values as demoSalesInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/demo-sales';
import { values as demoSalesImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/demo-sales';
import { values as demoSalesImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/demo-sales';

import { values as gswDemoInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/gsw/demo';
import { values as gswDemoInvoicingWebValues } from 'apps/invoicing-web/chart/gsw/demo';
import { values as gswDemoInvoicingAdminValues } from 'apps/invoicing-admin/chart/gsw/demo';
import { values as gswDemoInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/gsw/demo';

import { values as preproductionInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/preproduction';
import { values as preproductionInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/preproduction';
import { values as preproductionInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/preproduction';
import { values as preproductionInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/preproduction';
import { values as preproductionImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/preproduction';
import { values as preproductionImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/preproduction';

import { values as gswProdInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/gsw/prod';
import { values as gswProdInvoicingWebValues } from 'apps/invoicing-web/chart/gsw/prod';
import { values as gswProdInvoicingAdminValues } from 'apps/invoicing-admin/chart/gsw/prod';
import { values as gswProdReportingValues } from 'apps/reporting-backend/chart/gsw/prod';
import { values as gswProdInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/gsw/prod';

import { values as hindawiProdInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/prod';
import { values as hindawiProdInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/prod';
import { values as hindawiProdInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/prod';
import { values as hindawiProdReportingValues } from 'apps/reporting-backend/chart/hindawi/prod';
import { values as hindawiProdInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/prod';
import { values as hindawiProdImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/prod';
import { values as hindawiProdImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/prod';

import { values as automationInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/automation';
import { values as automationInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/automation';
import { values as automationInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/automation';
import { values as automationReportingBackendValues } from 'apps/reporting-backend/chart/hindawi/automation';
//TODO create secrets
import { values as automationInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/automation';
import { values as automationImportManuscriptBackend } from 'apps/import-manuscript-backend/chart/hindawi/automation';
import { values as automationImportManuscriptValidation } from 'apps/import-manuscript-validation/chart/hindawi/automation';

const masterConfig: {
  [tenant: string]: {
    [env: string]: { [app: string]: WithAwsSecretsServiceProps };
  };
} = {
  [Tenant.hindawi]: {
    prod: {
      [App.invoicingErpInvoiceRegistration]: hindawiProdInvoicingErpInvoiceRegistrationValues,
      [App.graphql]: hindawiProdInvoicingGraphqlValues,
      [App.admin]: hindawiProdInvoicingAdminValues,
      [App.reporting]: hindawiProdReportingValues,
      [App.web]: hindawiProdInvoicingWebValues,
      [App.importManuscriptBackend]: hindawiProdImportManuscriptBackend,
      [App.importManuscriptValidation]: hindawiProdImportManuscriptValidation,
    },
    preproduction: {
      [App.invoicingErpInvoiceRegistration]: preproductionInvoicingErpInvoiceRegistrationValues,
      [App.graphql]: preproductionInvoicingGraphqlValues,
      [App.admin]: preproductionInvoicingAdminValues,
      [App.web]: preproductionInvoicingWebValues,
      [App.importManuscriptBackend]: preproductionImportManuscriptBackend,
      [App.importManuscriptValidation]: preproductionImportManuscriptValidation,
    },
    demo: {
      [App.invoicingErpInvoiceRegistration]: demoInvoicingErpInvoiceRegistrationValues,
      [App.graphql]: demoInvoicingGraphqlValues,
      [App.admin]: demoInvoicingAdminValues,
      [App.web]: demoInvoicingWebValues,
      [App.importManuscriptBackend]: demoImportManuscriptBackend,
      [App.importManuscriptValidation]: demoImportManuscriptValidation,
    },
    'demo-sales': {
      [App.invoicingErpInvoiceRegistration]: demoSalesInvoicingErpInvoiceRegistrationValues,
      [App.graphql]: demoSalesInvoicingGraphqlValues,
      [App.admin]: demoSalesInvoicingAdminValues,
      [App.web]: demoSalesInvoicingWebValues,
      [App.importManuscriptBackend]: demoSalesImportManuscriptBackend,
      [App.importManuscriptValidation]: demoSalesImportManuscriptValidation,
    },
    qa: {
      [App.invoicingErpInvoiceRegistration]: qaInvoicingErpInvoiceRegistrationValues,
      [App.reporting]: qaReportingBackendValues,
      [App.graphql]: qaInvoicingGraphqlValues,
      [App.admin]: qaInvoicingAdminValues,
      [App.web]: qaInvoicingWebValues,
      [App.importManuscriptBackend]: qaImportManuscriptBackend,
      [App.importManuscriptValidation]: qaImportManuscriptValidation,

    },
    automation:{
      [App.invoicingErpInvoiceRegistration]: automationInvoicingErpInvoiceRegistrationValues,
      [App.reporting]: automationReportingBackendValues,
      [App.graphql]: automationInvoicingGraphqlValues,
      [App.admin]: automationInvoicingAdminValues,
      [App.web]: automationInvoicingWebValues,
      [App.importManuscriptBackend]: automationImportManuscriptBackend,
      [App.importManuscriptValidation]: automationImportManuscriptValidation,
    },
    dev: {
      [App.invoicingErpInvoiceRegistration]: devInvoicingErpInvoiceRegistrationValues,
      [App.reporting]: devReportingBackendValues,
      [App.graphql]: devInvoicingGraphqlValues,
      [App.admin]: devInvoicingAdminValues,
      [App.web]: devInvoicingWebValues,
      [App.importManuscriptBackend]: devImportManuscriptBackend,
      [App.importManuscriptValidation]: devImportManuscriptValidation,

    },
  },
  [Tenant.gsw]: {
    prod: {
      [App.invoicingErpInvoiceRegistration]: gswProdInvoicingErpInvoiceRegistrationValues,
      [App.graphql]: gswProdInvoicingGraphqlValues,
      [App.admin]: gswProdInvoicingAdminValues,
      [App.reporting]: gswProdReportingValues,
      [App.web]: gswProdInvoicingWebValues,
    },
    demo: {
      [App.invoicingErpInvoiceRegistration]: gswDemoInvoicingErpInvoiceRegistrationValues,
      [App.graphql]: gswDemoInvoicingGraphqlValues,
      [App.admin]: gswDemoInvoicingAdminValues,
      [App.web]: gswDemoInvoicingWebValues,
    },
  },
};

export { masterConfig };
