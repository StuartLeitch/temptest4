import React, { Fragment } from "react";
import { Flex, Label, Title, Text } from "@hindawi/react-components";

interface Props {
  accountName?: string;
  accountType?: string;
  accountNumber?: string;
  sortCode?: string;
  switft?: string;
  iban?: string;
  bankAddress?: string;
  beneficiaryAddress?: string;
}

const BankTransferRow = ({ label, value }) => (
  <Flex justifyContent="flex-start" mt={2}>
    <Flex flex={1} justifyContent="flex-start">
      <Label>{label}</Label>
    </Flex>
    <Flex flex={3} justifyContent="flex-start">
      <Text>{value}</Text>
    </Flex>
  </Flex>
);

const BankTransfer: React.FunctionComponent<Props> = ({
  accountName,
  accountType,
  accountNumber,
  sortCode,
  switft,
  iban,
  bankAddress,
  beneficiaryAddress,
}) => {
  return (
    <Fragment>
      <Title type="small">Bank Transfer Details</Title>

      <BankTransferRow label="Account Name" value={accountName} />
      <BankTransferRow label="Account Type" value={accountType} />
      <BankTransferRow label="Account Number" value={accountNumber} />
      <BankTransferRow label="Sort Code" value={sortCode} />
      <BankTransferRow label="SWIFT/BIC Code" value={switft} />
      <BankTransferRow label="IBAN" value={iban} />
      <BankTransferRow label="Bank Address" value={bankAddress} />
      <BankTransferRow label="Beneficiary Address" value={beneficiaryAddress} />
    </Fragment>
  );
};

BankTransfer.defaultProps = {
  accountName: "Hindawi Limited",
  accountType: "FGN Current",
  accountNumber: "00113905",
  sortCode: "090715",
  switft: "ABBYGB2LXXX",
  iban: "GB60ABBY09071500113905",
  bankAddress:
    "Santander UK PLC, Corporate Banking, Bridle Road, Bootle, Merseyside, L30 4GB",
  beneficiaryAddress:
    "Hindawi Ltd., Adam House, Third Floor, 1 Fitzroy Square, London W1T 5HF, UK",
};

export default BankTransfer;
