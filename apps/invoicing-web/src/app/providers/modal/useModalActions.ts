import { useDispatch } from "react-redux";
import { showModal, hideModal } from "./redux/actions";

export const useModalActions = () => {
  const dispatch = useDispatch();

  const dispatchedShowModal = () => dispatch(showModal());
  const dispatchedHideModal = () => dispatch(hideModal());

  return {
    showModal: dispatchedShowModal,
    hideModal: dispatchedHideModal,
  };
};
