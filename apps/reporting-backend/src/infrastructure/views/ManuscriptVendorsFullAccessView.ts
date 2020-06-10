import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import manuscriptsView from './ManuscriptsView';

class ManuscriptVendorsFullAccessView extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE OR REPLACE VIEW ${this.getViewName()}
AS SELECT * from ${manuscriptsView.getViewName()};
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
    return 'manuscript_vendors_full_access';
  }
}

const manuscriptVendorsFullAccessView = new ManuscriptVendorsFullAccessView();
manuscriptVendorsFullAccessView.addDependency(manuscriptsView);

export default manuscriptVendorsFullAccessView;
