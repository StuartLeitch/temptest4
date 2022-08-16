import React from "react";
import { Expander } from "@hindawi/react-components";

import { DetailItem } from "../DetailItem";

import { ArticleDetails as Root } from "./ArticleDetails.styles";
import { config } from "../../../../../config";

interface Props {
  article: any;
}

const ArticleDetails: React.FunctionComponent<Props> = ({ article }: any) => {
  return (
    <Expander title="Article Details" expanded>
      <Root>
        <DetailItem label="Journal Title" text={article.journalTitle} />
        <DetailItem label="Article Title" text={article.title} />
        <DetailItem
          link
          label="DOI Number"
          text={`https://doi.org/${config.doiNumber}/${new Date(
            article.datePublished,
          ).getFullYear()}/${article.customId}`}
        />
        <DetailItem label="Article ID" text={article.customId} />
        <DetailItem label="Article Type" text={article.articleType} />
        <DetailItem label="CC License" text="CC-BY 4.0" />
        <DetailItem
          label="Corresponding Author"
          text={`${article.authorFirstName} ${article.authorSurname}`}
        />
        <DetailItem label="Preprint ID" text={article.preprintValue} />
      </Root>
    </Expander>
  );
};

export default ArticleDetails;
