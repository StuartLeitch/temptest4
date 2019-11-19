import React from "react";
import { Expander } from "@hindawi/react-components";

import { DetailItem } from "../DetailItem";

import { ArticleDetails as Root } from "./ArticleDetails.styles";

interface Props {
  article: any;
}

const ArticleDetails: React.FunctionComponent<Props> = ({ article }) => {
  return (
    <Expander title="Article details" expanded>
      <Root>
        <DetailItem label="Journal Title" text={article.journalTitle} />
        <DetailItem label="Article Title" text={article.title} />
        <DetailItem
          link
          label="DOI Number"
          text={`https://doi.org/10.1155/year/${article.customId}`}
        />
        <DetailItem label="Article ID" text={article.customId} />
        <DetailItem label="Article Type" text={article.articleType} />
        <DetailItem label="CC License" text="CC-BY 4.0" />
        <DetailItem
          label="Corresponding Author"
          text={`${article.authorFirstName} ${article.authorSurname}`}
        />
      </Root>
    </Expander>
  );
};

export default ArticleDetails;
