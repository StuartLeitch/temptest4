import {capitalize} from 'lodash';
import {space, layout, flexbox} from 'styled-system';
import styled, {css, AnyStyledComponent} from 'styled-components';

import {lighten, th} from '../Theme';

const buttonType = ({type}: {type: string}) => {
  switch (type) {
    case 'secondary':
      return css`
        color: ${th('buttons.secondary.color')};
        background-color: ${th('buttons.secondary.bg')};

        &:hover {
          background-color: ${lighten('buttons.secondary.bg', 30)};
        }
      `;
    case 'outline':
      return css`
        border-radius: ${th('gridUnit')};
        border: ${th('buttons.outline.border')};

        background-color: ${th('buttons.outline.bg')};
        color: ${th('buttons.outline.color')};

        &:hover {
          background-color: ${th('buttons.outline.color')};
          color: ${th('buttons.outline.bg')};
        }
      `;
    case 'primary':
    default:
      return css`
        color: ${th('buttons.primary.color')};
        background-color: ${th('buttons.primary.bg')};

        &:hover {
          background-color: ${lighten('buttons.primary.bg', 10)};
        }
      `;
  }
};

const buttonSize = ({size}: {size: string}) => {
  switch (size) {
    case 'small':
      return css`
        height: calc(${th('gridUnit')} * 6);
        min-width: calc(${th('gridUnit')} * 15);
      `;
    case 'medium':
      return css`
        height: calc(${th('gridUnit')} * 8);
        min-width: calc(${th('gridUnit')} * 20);
      `;
    case 'large':
    default:
      return css`
        height: calc(${th('gridUnit')} * 10);
        min-width: calc(${th('gridUnit')} * 35);
        text-transform: uppercase;
      `;
  }
};

export const Button: AnyStyledComponent = styled.button`
  align-items: center;
  border: none;
  border-radius: ${th('gridUnit')};
  cursor: pointer;
  display: flex;
  font-size: ${({size}) => th(`fontSizes.button${capitalize(size)}`)};
  line-height: ${th('fontSizes.lineHeight')};
  justify-content: center;
  padding: 0 calc(${th('gridUnit')} * 2);
  white-space: nowrap;

  ${space};
  ${layout};
  ${flexbox};
  ${buttonSize};
  ${buttonType};

  &:disabled {
    border: none;
    background-color: ${th('buttons.disabled.bg')};
    color: ${th('buttons.disabled.color')};
    cursor: not-allowed;

    & > * {
      color: ${th('buttons.disabled.color')};
      fill: ${th('buttons.disabled.color')};
    }
  }
`;
