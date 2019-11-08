import { createReducer } from "typesafe-actions";

import { showModal, hideModal } from "./actions";

const initialState = false;

const modal = createReducer(initialState)
  .handleAction(showModal, () => true)
  .handleAction(hideModal, () => false);

export default modal;
