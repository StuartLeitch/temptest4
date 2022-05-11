import React, { useState } from 'react';

import { Select, Form, IconCaretUp, IconCaretDown } from '@hindawi/phenom-ui';

const { Option } = Select;

interface PublisherCellProps extends React.HTMLAttributes<HTMLElement> {
  dataIndex: string | string[];
  index: number;
  publishers: any;
}

const PublisherCell: React.FC<PublisherCellProps> = ({
  dataIndex,
  publishers,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <Form.Item
        name={dataIndex}
        style={{ margin: 0 }}
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Select
          onClick={() => setOpen(!open)}
          suffixIcon={
            open ? (
              <IconCaretUp onClick={() => setOpen(!open)} />
            ) : (
              <IconCaretDown onClick={() => setOpen(!open)} />
            )
          }
          open={open}
          style={{ width: 100 }}
        >
          {publishers &&
            publishers.map((publisher, index) => {
              const { name } = publisher;

              return (
                <Option key={index} value={name}>
                  {' '}
                  {name}
                </Option>
              );
            })}
        </Select>
      </Form.Item>
    </React.Fragment>
  );
};

export default PublisherCell;
