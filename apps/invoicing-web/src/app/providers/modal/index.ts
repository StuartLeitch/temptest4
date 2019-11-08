import * as modalRedux from "./redux";
import Modal from "./Modal";
import { useModalActions } from "./useModalActions";

const { modalActions, modalSelectors, default: modalReducer } = modalRedux;

export { Modal, modalActions, modalSelectors, modalReducer, useModalActions };
