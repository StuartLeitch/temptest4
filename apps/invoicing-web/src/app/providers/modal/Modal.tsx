import React from "react";
import { connect } from "react-redux";
// import { createPortal } from "react-dom";
import { RootState } from "typesafe-actions";

// import { Overlay } from "./Modal.styles";
// import { modalSelectors } from "./redux";

const Portal = ({ children }) => <div className="portal">{children}</div>;
console.info(Portal);
const Modal = ({ children, isVisible }) => {
  return isVisible && <Portal>{children}</Portal>;
};

// const mapStateToProps = (state: RootState) => ({
//   isVisible: modalSelectors.isVisible(state),
// });

export default Modal; // connect(mapStateToProps)(Modal);
