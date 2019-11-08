import { createSelector } from "reselect";

const getModal = state => {
  return state.modal;
};

export const isVisible = createSelector(
  getModal,
  modal => modal,
);
