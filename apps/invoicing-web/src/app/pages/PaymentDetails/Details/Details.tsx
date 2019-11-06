import React from "react";
import { Expander } from "@hindawi/react-components";

import { DetailItem } from "./detail-item";

import { Details as Root } from "./details.styles";

interface Props {}

const articleDetails = {
  journalTitle: "Parkinson's Disease",
  title:
    "A Key Major Guideline for Engineering Bioactive Multicomponent Nanofunctionalization for Biomedicine and Other Applications: Fundamental Models Confirmed by Both Direct and Indirect Evidence",
  id: 2016970,
  type: "Research Article",
  ccLicense: "CC-BY 4.0",
  correspondingAuthor: "Patrick M. Sullivan",
  authors: [
    "Patrick M. Sullivan",
    "Patrick M. Sullivan1",
    "Patrick M. Sullivan2",
    "Patrick M. Sullivan3",
  ],
};

const Details: React.FunctionComponent<Props> = () => {
  return (
    <Expander title="Article details" expanded={true}>
      <Root>
        <DetailItem label="Journal title" text={articleDetails.journalTitle} />
        <DetailItem label="Article title" text={articleDetails.title} />
        <DetailItem label="Article ID" text={articleDetails.id.toString()} />
        <DetailItem label="Article Type" text={articleDetails.type} />
        <DetailItem label="CC License" text={articleDetails.ccLicense} />
        <DetailItem label="Corresponding Author" text={articleDetails.correspondingAuthor} />
        <DetailItem label="Additional Authors" text={articleDetails.authors} />
      </Root>
    </Expander>
  );
};

export default Details;
