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

export class PackageSuccessfulValidationTemplate {
  static build(
    fileName: string,
    manuscriptTitle: string,
    reviewSubmissionButton: string,
    successText: string
  ): EmailContent {
    const subject = `[PackageSubmission] A package has been successfully validated!`;

    const paragraph = `
    ${successText}<br />
    <br />
    <span style="${titleStyle}">
      <b>Package Name:</b>
    </span>
    <span style="${paragraphStyle}">${fileName}</span><br />
    <br />
    <span style="${labelStyle}">Manuscript title</span><br />
    ${manuscriptTitle}
    <br />
    <span style="${paragraphStyle}">To finish the submission of the imported package, please make sure that all the steps are completed properly.</span>
    <br />
    <br />
    <br />
    ${reviewSubmissionButton}

    <br />
    <br />
    <span style="${paragraphStyle}">Kind regards,</span><br />
    <span style="${titleStyle}">Customer Service Team</span>
    `;

    return {
      paragraph,
      subject,
    };
  }
}
