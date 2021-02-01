import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import manuscriptsView from './ManuscriptsView';

class ManuscriptVendorsView
  extends AbstractEventView
  implements EventViewContract {
  constructor() {
    super();
    this.shouldRefresh = false;
  }
  getCreateQuery(): string {
    return `
CREATE OR REPLACE VIEW ${this.getViewName()}
AS SELECT * from ${manuscriptsView.getViewName()} m where m.final_decision_type IS NULL;
    `;
  }

  getDeleteQuery() {
    return `DROP VIEW IF EXISTS ${this.getViewName()}`;
  }

  getRefreshQuery(): string {
    return ``;
  }
  postCreateQueries = [];

  getViewName(): string {
    return 'manuscript_vendors';
  }
}

const manuscriptsVendorView = new ManuscriptVendorsView();
manuscriptsVendorView.addDependency(manuscriptsView);

export default manuscriptsVendorView;
