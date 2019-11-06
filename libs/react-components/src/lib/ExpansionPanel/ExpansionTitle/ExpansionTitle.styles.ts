import styled, {css, AnyStyledComponent} from 'styled-components';
import {space, layout, flexbox} from 'styled-system';

import {bold} from '../../Typography/fontTypes';
import {th} from '../../Theme';

const collapse = css`
  border-radius: 5px;
`;

const collapseBody = ({expanded}: {expanded: boolean}) => {
  if (!expanded) return collapse;
};

export const ExpansionTitle: AnyStyledComponent = styled.div`
  padding: calc(${th('gridUnit')} * 2) calc(${th('gridUnit')} * 4);
  border-bottom: 1px solid ${th('colors.transparent')};
  background-color: ${th('colors.background')};
  color: ${th('colors.textPrimary')};
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  justify-content: flex-start;
  align-items: center;
  flex-direction: row;
  display: flex;

  & > * {
    padding-right: calc(${th('gridUnit')} * 2);
    line-height: 22px;

    &:last-child {
      padding-right: 0;
    }
  }

  ${collapseBody}
  ${layout};
  ${space};
  ${bold};

  .expansion-body {
    padding: calc(${th('gridUnit')} * 4);

    ${flexbox}
  }
`;
