// TODO generate this based on apps folder structure
import { App, Tenant } from '../../types';
import { WithAwsSecretsServiceProps } from '@hindawi/phenom-charts';

// `import { values as ${env}${invoicingAdmin}Values } from 'apps/${app}/chart/${tenant}/${env}'`
import { values as devInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/dev';
import { values as devInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/dev';
import { values as devInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/dev';
import { values as devReportingBackendValues } from 'apps/reporting-backend/chart/hindawi/dev';
import { values as devInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/dev';
import { values as devInvoicingRevenueRecognitionRegistrationValues } from 'apps/invoicing-revenue-recognition-registration/chart/hindawi/dev';

import { values as qaInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/qa';
import { values as qaInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/qa';
import { values as qaInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/qa';
import { values as qaReportingBackendValues } from 'apps/reporting-backend/chart/hindawi/qa';
import { values as qaInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/qa';
import { values as qaInvoicingRevenueRecognitionRegistrationValues } from 'apps/invoicing-revenue-recognition-registration/chart/hindawi/qa';

import { values as demoInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/demo';
import { values as demoInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/demo';
import { values as demoInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/demo';
import { values as demoInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/demo';
import { values as demoInvoicingRevenueRecognitionRegistrationValues } from 'apps/invoicing-revenue-recognition-registration/chart/hindawi/demo';

import { values as demoSalesInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/demo-sales';
import { values as demoSalesInvoicingRevenueRecognitionRegistrationValues } from 'apps/invoicing-revenue-recognition-registration/chart/hindawi/demo-sales';

import { values as gswDemoInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/gsw/demo';
import { values as gswDemoInvoicingWebValues } from 'apps/invoicing-web/chart/gsw/demo';
import { values as gswDemoInvoicingAdminValues } from 'apps/invoicing-admin/chart/gsw/demo';
import { values as gswDemoInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/gsw/demo';
import { values as gswDemoInvoicingRevenueRecognitionRegistrationValues } from 'apps/invoicing-revenue-recognition-registration/chart/gsw/demo';

import { values as preproductionInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/preproduction';
import { values as preproductionInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/preproduction';
import { values as preproductionInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/preproduction';
import { values as preproductionInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/preproduction';
import { values as preproductionInvoicingRevenueRecognitionRegistrationValues } from 'apps/invoicing-revenue-recognition-registration/chart/hindawi/preproduction';

import { values as gswProdInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/gsw/prod';
import { values as gswProdInvoicingWebValues } from 'apps/invoicing-web/chart/gsw/prod';
import { values as gswProdInvoicingAdminValues } from 'apps/invoicing-admin/chart/gsw/prod';
import { values as gswProdReportingValues } from 'apps/reporting-backend/chart/gsw/prod';
import { values as gswProdInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/gsw/prod';
import { values as gswProdInvoicingRevenueRecognitionRegistrationValues } from 'apps/invoicing-revenue-recognition-registration/chart/gsw/prod';

import { values as hindawiProdInvoicingGraphqlValues } from 'apps/invoicing-graphql/chart/hindawi/prod';
import { values as hindawiProdInvoicingWebValues } from 'apps/invoicing-web/chart/hindawi/prod';
import { values as hindawiProdInvoicingAdminValues } from 'apps/invoicing-admin/chart/hindawi/prod';
import { values as hindawiProdReportingValues } from 'apps/reporting-backend/chart/hindawi/prod';
import { values as hindawiProdInvoicingErpInvoiceRegistrationValues } from 'apps/invoicing-erp-invoice-registration/chart/hindawi/prod';
import { values as hindawiProdInvoiceRevenueRecognitionRegistrationValues } from 'apps/invoicing-revenue-recognition-registration/chart/hindawi/prod';

const masterConfig: {
  [tenant: string]: {
    [env: string]: { [app: string]: WithAwsSecretsServiceProps };
  };
} = {
  [Tenant.hindawi]: {
    prod: {
      [App.invoicingErpInvoiceRegistration]: hindawiProdInvoicingErpInvoiceRegistrationValues,
      [App.invoicingRevenueRecognitionRegistration]: hindawiProdInvoiceRevenueRecognitionRegistrationValues,
      [App.graphql]: hindawiProdInvoicingGraphqlValues,
      [App.admin]: hindawiProdInvoicingAdminValues,
      [App.reporting]: hindawiProdReportingValues,
      [App.web]: hindawiProdInvoicingWebValues,
    },
    preproduction: {
      [App.invoicingErpInvoiceRegistration]: preproductionInvoicingErpInvoiceRegistrationValues,
      [App.invoicingRevenueRecognitionRegistration]: preproductionInvoicingRevenueRecognitionRegistrationValues,
      [App.graphql]: preproductionInvoicingGraphqlValues,
      [App.admin]: preproductionInvoicingAdminValues,
      [App.web]: preproductionInvoicingWebValues,
    },
    demo: {
      [App.invoicingErpInvoiceRegistration]: demoInvoicingErpInvoiceRegistrationValues,
      [App.invoicingRevenueRecognitionRegistration]: demoInvoicingRevenueRecognitionRegistrationValues,
      [App.graphql]: demoInvoicingGraphqlValues,
      [App.admin]: demoInvoicingAdminValues,
      [App.web]: demoInvoicingWebValues,
    },
    'demo-sales': {
      [App.invoicingErpInvoiceRegistration]: demoSalesInvoicingErpInvoiceRegistrationValues,
      [App.invoicingRevenueRecognitionRegistration]: demoSalesInvoicingRevenueRecognitionRegistrationValues,
      [App.graphql]: demoSalesInvoicingGraphqlValues,
      [App.admin]: demoSalesInvoicingAdminValues,
      [App.web]: demoSalesInvoicingWebValues,
    },
    qa: {
      [App.invoicingErpInvoiceRegistration]: qaInvoicingErpInvoiceRegistrationValues,
      [App.invoicingRevenueRecognitionRegistration]: qaInvoicingRevenueRecognitionRegistrationValues,
      [App.reporting]: qaReportingBackendValues,
      [App.graphql]: qaInvoicingGraphqlValues,
      [App.admin]: qaInvoicingAdminValues,
      [App.web]: qaInvoicingWebValues,
    },
    dev: {
      [App.invoicingErpInvoiceRegistration]: devInvoicingErpInvoiceRegistrationValues,
      [App.invoicingRevenueRecognitionRegistration]: devInvoicingRevenueRecognitionRegistrationValues,
      [App.reporting]: devReportingBackendValues,
      [App.graphql]: devInvoicingGraphqlValues,
      [App.admin]: devInvoicingAdminValues,
      [App.web]: devInvoicingWebValues,
    },
  },
  [Tenant.gsw]: {
    prod: {
      [App.invoicingErpInvoiceRegistration]: gswProdInvoicingErpInvoiceRegistrationValues,
      [App.invoicingRevenueRecognitionRegistration]: gswProdInvoicingRevenueRecognitionRegistrationValues,
      [App.graphql]: gswProdInvoicingGraphqlValues,
      [App.admin]: gswProdInvoicingAdminValues,
      [App.reporting]: gswProdReportingValues,
      [App.web]: gswProdInvoicingWebValues,
    },
    demo: {
      [App.invoicingErpInvoiceRegistration]: gswDemoInvoicingErpInvoiceRegistrationValues,
      [App.invoicingRevenueRecognitionRegistration]: gswDemoInvoicingRevenueRecognitionRegistrationValues,
      [App.graphql]: gswDemoInvoicingGraphqlValues,
      [App.admin]: gswDemoInvoicingAdminValues,
      [App.web]: gswDemoInvoicingWebValues,
    },
  },
};

export { masterConfig };
