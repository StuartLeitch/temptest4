import { EmailContent } from '../EmailProps';

const titleStyle = `
  font-family: 'Nunito', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 19px;
  color: #4F4F4F;
`;

const paragraphStyle = `
  font-family: 'Nunito', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 19px;
`;

const labelStyle = `
  font-family: 'Nunito', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 14px;
  line-height: 15px;
  color: #4F4F4F;
`;

export class PackageUnsuccessfulValidationTemplate {
  static build(
    fileName: string,
    reasonsList: string,
    gotoPhenomButton: string,
    unsuccessText: string
  ): EmailContent {
    const subject = `[PackageSubmission] A package has NOT been successfully validated!`;

    const paragraph = `
    ${unsuccessText}<br />
    <br />
    <span style="${titleStyle}">
      <b>Package Name: </b>
    </span>
    <span style="${paragraphStyle}">${fileName}</span><br />
    <br />

    <span style="${labelStyle}">Reason &amp; Details</span><br />
    <span style="${paragraphStyle}">
      This document seems to have issues as listed below:<br />
    </span>
      ${reasonsList}
      <br />
      <span style="${paragraphStyle}">Please fix the error(s) and retry importing the package. In case this doesn’t work either, please consider introducing the data manually. </span>

    <br />
    <br />
    <br />
    ${gotoPhenomButton}

    <br />
    </br />
    <span style="${paragraphStyle}">Kind regards,</span><br />
    <span style="${titleStyle}">Customer Service Team</span>
    `;

    return {
      paragraph,
      subject,
    };
  }
}
