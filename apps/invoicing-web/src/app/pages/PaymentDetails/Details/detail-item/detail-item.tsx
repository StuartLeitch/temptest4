import React from "react";
import { Flex, Label, Text, ActionLink } from "@hindawi/react-components";

import { DetailItem as Root } from "./detail-item.styles";

interface Props {
  text: string | string[];
  label: string;
}

const getTextContent = (text: string | string[]) => {
  if (Array.isArray(text)) {
    return <ActionLink type="action">View author list</ActionLink>;
  } else {
    return <Text>{text}</Text>;
  }
};

const DetailItem: React.FC<Props> = ({ label, text }) => {
  return (
    <Root>
      <Flex alignItems="flex-start" justifyContent="flex-start">
        <Flex flex={1} justifyContent="flex-start">
          <Label>{label}</Label>
        </Flex>
        <Flex flex={5} justifyContent="flex-start">
          {getTextContent(text)}
        </Flex>
      </Flex>
    </Root>
  );
};

export default DetailItem;
