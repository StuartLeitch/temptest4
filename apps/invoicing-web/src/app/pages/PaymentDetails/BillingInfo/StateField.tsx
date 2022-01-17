import React, { useState } from "react";
import stateList from "state-list";
import { space, layout } from "styled-system";
import styled, { css } from "styled-components";

import { Icon, Text, th, lighten } from "@hindawi/react-components";

const filterState = (inputState: string) => ([stateCode, stateName]: [
  string,
  string,
]) => {
  return stateName.toLowerCase().startsWith(inputState.toLowerCase());
};

const StateField = ({ value, onChange, name, status }) => {
  const states = stateList.name;
  const [expanded, setExpanded] = useState(false);
  const [stateInput, setStateInput] = useState(() =>
    !value ? "" : stateList.name[value],
  );

  const toggleMenu = () => {
    setExpanded(s => !s);
  };

  const selectState = (state: string) => () => {
    onChange(name)(state);
    setStateInput(stateList.name[state]);
  };

  const setState = e => {
    setStateInput(e.target.value);
  };

  return (
    <Relative>
      <Root status={status}>
        <StateInput
          id={name}
          value={stateInput}
          onBlur={toggleMenu}
          onFocus={toggleMenu}
          onChange={setState}
        />
        <Icon
          name={expanded ? "caretUp" : "caretDown"}
          color={"colors.textPrimary"}
        />
      </Root>
      {expanded && (
        <DropdownList>
          {Object.entries(states)
            .filter(filterState(stateInput))
            .map(([stateCode, stateName]) => (
              <DropdownItem
                key={stateCode}
                onMouseDown={selectState(stateCode)}
              >
                <Text>{stateName}</Text>
              </DropdownItem>
            ))}
        </DropdownList>
      )}
    </Relative>
  );
};

export default StateField;

const statusColor = ({ status }: { status: any }) => {
  switch (status) {
    case "warning":
      return css`
        border-color: ${lighten("colors.warning", 30)};

        &:hover {
          border-color: ${lighten("colors.warning", 10)};
        }

        &:focus,
        &:active {
          border-color: ${th("colors.warning")};
        }
      `;
    case "info":
      return css`
        border-color: ${lighten("colors.info", 30)};

        &:hover {
          border-color: ${lighten("colors.info", 10)};
        }

        &:focus,
        &:active {
          border-color: ${th("colors.info")};
        }
      `;
    case "success":
      return css`
        border-color: ${lighten("colors.actionPrimary", 30)};

        &:hover {
          border-color: ${lighten("colors.actionPrimary", 10)};
        }

        &:focus,
        &:active {
          border-color: ${th("colors.actionPrimary")};
          border-color: red;
        }
      `;
    case "none":
    default:
      return css`
        border-color: ${th("colors.disabled")};

        &:hover {
          border-color: ${lighten("colors.textPrimary", 60)};
        }

        &:focus,
        &:active {
          border-color: ${th("colors.textPrimary")};
        }
      `;
  }
};

const StateInput = styled.input`
  border: none;
  outline: none;
  width: 100%;

  &:focus,
  &:active {
    outline: none;
  }
`;

const Relative = styled.div`
  position: relative;
  width: 100%;
`;

const Root = styled.div`
  align-items: center;
  border: 1px solid ${th("colors.disabled")};
  border-radius: ${th("gridUnit")};
  color: ${th("colors.textPrimary")};
  box-sizing: border-box;
  display: flex;
  height: calc(${th("gridUnit")} * 8);
  outline: none;
  padding: 0 calc(${th("gridUnit")} * 2);
  width: 100%;

  ${statusColor};
  ${space};
  ${layout};
`;

const DropdownItem = styled.div`
  align-items: center;
  cursor: pointer;
  color: ${th("colors.textPrimary")};
  display: flex;
  height: calc(${th("gridUnit")} * 8);
  padding: 0 calc(${th("gridUnit")} * 2);

  &:hover {
    background-color: ${th("colors.background")};
  }
`;

const DropdownList = styled.div`
  background-color: ${th("colors.white")};
  border-radius: ${th("gridUnit")};
  box-shadow: 0px 2px 6px ${th("colors.disabled")};
  margin-top: ${th("gridUnit")};
  position: absolute;
  overflow: scroll;

  max-height: calc(${th("gridUnit")} * 8 * 4);
  width: 100%;
  z-index: 10;
`;
