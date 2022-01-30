import React, { useState } from 'react';

import {
  Table,
  Button,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
  Input,
  UncontrolledButtonDropdown,
  DropdownItem,
} from '../../../components';
import { ApcType } from '../types';

const ApcList: React.FC<ApcListProps> = ({ apcItems }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  return (
    <div className='table-responsive-xl'>
      <Table className='mb-0 table-striped' hover>
        <thead>
          <tr>
            <th className='align-middle bt-0 font-weight-bold'>Journal Name</th>
            <th className='align-middle bt-0 font-weight-bold'>Journal Code</th>
            <th className='align-middle bt-0 font-weight-bold'>ISSN</th>
            <th className='align-middle bt-0 font-weight-bold'>Publisher</th>
            <th className='align-middle bt-0 font-weight-bold'>APC</th>
          </tr>
        </thead>
        <tbody>
          {/* {apcItems &&
            apcItems.map((apcItem, index) => {
              const {
                journalName,
                journalCode,
                issn,
                publisher,
                apc,
              } = apcItem; */}

          {/* return ( */}
          <tr>
            <td className='align-middle bt-0'>JOURNAL_NAME</td>
            <td className='align-middle bt-0'>'JOURNAL_CODE'</td>
            <td className='align-middle bt-0'>'ISSN'</td>
            <td className='align-middle bt-0'>
              <UncontrolledButtonDropdown>
                <DropdownToggle color='secondary' caret>
                  Hindawi
                  {/* {publisher}  */}
                </DropdownToggle>
                <DropdownMenu>
                  <DropdownItem onClick={() => console.log('Wiley selected')}>
                    Wiley
                  </DropdownItem>{' '}
                  {/* dynamic population of elements here */}
                  <DropdownItem>Sage</DropdownItem>
                </DropdownMenu>
              </UncontrolledButtonDropdown>
              {/* condition to make buttons appear if publisher value changed */}
              <Button
                color='ghost'
                onClick={() => console.log('cancel change')}
              >
                {' '}
                <i className='fas fa-times-circle mr-2'></i>{' '}
              </Button>
              <Button color='ghost' onClick={() => console.log('save change')}>
                <i className='fas fa-check-circle mr-2'></i>
              </Button>
            </td>

            <td className='align-middle bt-0'>
              {!isEditMode && (
                <React.Fragment>
                  <span className='text-green pl-0 pr-2'>APC</span>
                  <Button color='ghost' onClick={() => setIsEditMode(true)}>
                    <i className='fas fa-pencil-alt mr-2'></i>
                  </Button>
                </React.Fragment>
              )}
              {/* condition to make buttons appear if editMode is true value changed */}
              {isEditMode && (
                <React.Fragment>
                  <Input
                    size='md'
                    className='apcInput'
                    value='APC'
                    style={{ width: '20%', float: 'left' }}
                  />
                  <Button color='ghost' onClick={() => setIsEditMode(false)}>
                    {' '}
                    <i className='fas fa-times-circle mr-2'></i>{' '}
                  </Button>
                  <Button
                    color='ghost'
                    onClick={() => console.log('save change')}
                  >
                    <i className='fas fa-check-circle mr-2'></i>
                  </Button>
                </React.Fragment>
              )}
            </td>
          </tr>
          {/* );
            })} */}
        </tbody>
      </Table>
    </div>
  );
};

interface ApcListProps {
  apcItems: ApcType[];
}

export default ApcList;
