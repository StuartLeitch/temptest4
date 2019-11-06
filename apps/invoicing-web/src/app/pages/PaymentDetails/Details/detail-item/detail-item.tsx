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
      <Flex flex={1.2} justifyContent="flex-start">
        <Label>{label}</Label>
      </Flex>
      <Flex flex={2} justifyContent="flex-start">
        {getTextContent(text)}
      </Flex>
    </Root>
  );
};

export default DetailItem;
