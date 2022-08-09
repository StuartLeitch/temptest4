import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import journalsView from './JournalsView';

class JournalSectionsView
  extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW public.${this.getViewName()}
TABLESPACE pg_default
AS SELECT j.journal_id,
    j.journal_name,
    j.journal_issn,
    j.journal_code,
    j.event_date,
    js.id::text AS section_id,
    js.name AS section_name,
    cast_to_timestamp(js.created) AS created_date,
    cast_to_timestamp(js.updated) AS updated_date,
    js.specialissues_json AS special_issues_json,
    js.editors_json
   FROM ${journalsView.getViewName()} j
     JOIN journal_section js ON j.event_id = js.event_id
WITH NO DATA;
`;
  }

  postCreateQueries = [
    `CREATE INDEX a11_${this.getViewName()}_event_date_idx ON public.journal_sections USING btree (event_date)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_code_idx ON public.journal_sections USING btree (journal_code)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_id_idx ON public.journal_sections USING btree (journal_id)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_issn_idx ON public.journal_sections USING btree (journal_issn)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_name_idx ON public.journal_sections USING btree (journal_name)`,
  ];

  getViewName(): string {
    return 'journal_sections';
  }
}

const journalSectionsView = new JournalSectionsView();
journalSectionsView.addDependency(journalsView);

export default journalSectionsView;
