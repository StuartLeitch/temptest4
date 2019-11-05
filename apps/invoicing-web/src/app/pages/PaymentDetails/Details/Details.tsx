import React from "react";
import { Expander, Flex, Label, Text } from "@hindawi/react-components";

interface Props {}

const DetailsItems = ({ label, text }) => (
  <Flex alignItems="flex-start" mb={4}>
    <Flex flex={1}>
      <Label>{label}</Label>
    </Flex>
    <Flex flex={2}>
      <Text>{text}</Text>
    </Flex>
  </Flex>
);
const longLongMan = `Leverage agile frameworks to provide a robust synopsis for high level overviews.
Iterative approaches to corporate strategy foster collaborative thinking to further the
overall value proposition. Organically grow the holistic world view of disruptive
innovation via workplace diversity and empowerment.`;
const Deatils: React.FunctionComponent<Props> = () => {
  return (
    <Expander title="Article details">
      <DetailsItems label="Journal title" text="Medicine" />
      <DetailsItems label="Article title" text={longLongMan} />
    </Expander>
  );
};

export default Deatils;
