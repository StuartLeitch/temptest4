import React from "react";
import { connect } from "react-redux";
import { createPortal } from "react-dom";
import { RootState } from "typesafe-actions";

import { Overlay } from "./Modal.styles";
import { modalSelectors } from "./redux";

const Modal = ({ children, isVisible }) => {
  return isVisible && <Portal>{children}</Portal>;
};

const Portal = ({ children }) =>
  createPortal(<Overlay>{children}</Overlay>, document.body);

const mapStateToProps = (state: RootState) => ({
  isVisible: modalSelectors.isVisible(state),
});

export default connect(mapStateToProps)(Modal);
