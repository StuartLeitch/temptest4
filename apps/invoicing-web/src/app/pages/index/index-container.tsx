import { connect } from "react-redux";

import { manuscriptRedux } from "../../state-management/redux";
import { Index } from "./index";

const { selectAuthor } = manuscriptRedux;

const mapStateToProps = (state: any) => ({
  author: selectAuthor(state),
});

// export const IndexContainer = Index;
export const IndexContainer = connect(
  mapStateToProps,
  {},
)(Index);
