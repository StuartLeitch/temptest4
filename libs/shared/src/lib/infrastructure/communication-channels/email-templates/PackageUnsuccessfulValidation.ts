import { EmailContent } from '../EmailProps';

// import { Invoice } from '../../../modules/invoices/domain/Invoice';

export class PackageUnsuccessfulValidationTemplate {
  static build(
    fileName: string,
    reasonsList,
    gotoPhenomButton,
    unsuccessText = 'Your uploaded zip file could not be analyzed!',
  ): EmailContent {
    const subject = `[PackageSubmission] A package has NOT been successfully validated!`;

    const paragraph = `
    ${unsuccessText}<br />
    <br />
    <b>Package Name: </b>${fileName}<br />
    <br />

    <b>Reason &amp; Details</b><br />
    This document seems to have issues as listed below:<br />
    ${reasonsList}<br /><br />

    Please fix the error(s) an retry importing the package. In case this doesn’t work either, please consider introducing the data manually.
    <br />
    <br />

    ${gotoPhenomButton}

    <br /></br />
      Kind regards,<br />
      <b>Phenom Team</b>
    `;

    return {
      paragraph,
      subject
    };
  }
}
