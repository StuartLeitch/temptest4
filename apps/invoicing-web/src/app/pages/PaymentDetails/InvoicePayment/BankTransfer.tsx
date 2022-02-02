import React, { Fragment } from "react";
import { Flex, Label, Title, Text } from "@hindawi/react-components";

import { config } from "../../../../config";

interface Props {
  invoiceReference?: string;
  accountName?: string;
  accountType?: string;
  accountNumber?: string;
  sortCode?: string;
  swift?: string;
  iban?: string;
  bankAddress?: string;
  beneficiaryAddress?: string;
}

const BankTransferRow = ({ label, value }: any) => (
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
  invoiceReference,
  accountName,
  accountType,
  accountNumber,
  sortCode,
  swift,
  iban,
  bankAddress,
  beneficiaryAddress,
}: any) => {
  return (
    <Fragment>
      <Title type="small">Bank Transfer Details</Title>

      <BankTransferRow label="Account Name" value={accountName} />
      <BankTransferRow label="Account Type" value={accountType} />
      <BankTransferRow label="Account Number" value={accountNumber} />
      <BankTransferRow label="Sort Code" value={sortCode} />
      <BankTransferRow label="SWIFT/BIC Code" value={swift} />
      <BankTransferRow label="IBAN" value={iban} />
      <BankTransferRow label="Bank Address" value={bankAddress} />
      <BankTransferRow label="Beneficiary Address" value={beneficiaryAddress} />
      <BankTransferRow label="Reference Number" value={invoiceReference} />
    </Fragment>
  );
};

BankTransfer.defaultProps = { ...config.bankDetails };

export default BankTransfer;
