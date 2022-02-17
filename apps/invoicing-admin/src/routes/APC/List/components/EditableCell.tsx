import React from 'react';

import { Select, Input, Form } from '@hindawi/phenom-ui';

import { Item } from '../../types';

import _ from 'lodash';

const { Option } = Select;

interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: any;
  inputType: 'number' | 'text';
  record: Item;
  index: number;
  publishers: any;
  children: React.ReactNode;
}

const EditableCell: React.FC<EditableCellProps> = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  publishers,
  ...restProps
}) => {
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
            },
          ]}
        >
          {dataIndex === 'amount' ? (
            <Input style={{ width: 80, textAlign: 'right' }} />
          ) : (
            <Select style={{ width: 100 }}>
              {publishers &&
                publishers.map((publisher, index) => {
                  const { name, id } = publisher;

                  return (
                    <Option key={index} value={id}>
                      {' '}
                      {name}
                    </Option>
                  );
                })}
            </Select>
          )}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default EditableCell;
