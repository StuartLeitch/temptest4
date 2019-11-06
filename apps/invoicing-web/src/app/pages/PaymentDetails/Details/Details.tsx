import React from "react";
import { Expander } from "@hindawi/react-components";

import { DetailItem } from "./DetailItem";

import { Details as Root } from "./Details.styles";

interface Props {
  articleDetails: any;
}

const Details: React.FunctionComponent<Props> = ({ articleDetails }) => {
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
