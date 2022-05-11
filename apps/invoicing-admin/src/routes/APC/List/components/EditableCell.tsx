import React from 'react';

import { Item } from '../../types';

import AmountCell from './AmountCell';
import PublisherCell from './PublisherCell';
import CheckboxCell from './CheckboxCell';

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string | string[];
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  publishers: any;
  colKey: string;
  children: React.ReactNode;
  formState: any;
  handleDisable: any;
}

const dynamicCell = (
  children: React.ReactNode,
  index: number,
  publishers: any,
  colKey: string,
  formState: any,
  handleDisable: any
) => {
  switch (colKey) {
    case 'amount':
      return (
        <AmountCell dataIndex='amount' index={index} formState={formState} />
      );
    case 'publisher':
      return (
        <PublisherCell
          dataIndex={['publisher', 'name']}
          publishers={publishers}
          index={index}
        />
      );
    case 'zeroPriced':
      return (
        <CheckboxCell handleDisabled={handleDisable} dataIndex={'zeroPriced'} />
      );
    default:
      return <td>{children}</td>;
  }
};

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  formState,
  index,
  children,
  publishers,
  colKey,
  handleDisable,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing
        ? dynamicCell(
            children,
            index,
            publishers,
            colKey,
            formState,
            handleDisable
          )
        : children}
    </td>
  );
};

export default EditableCell;
