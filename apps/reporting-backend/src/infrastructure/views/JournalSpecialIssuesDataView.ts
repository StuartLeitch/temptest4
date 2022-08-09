import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import journalsView from './JournalsView';

class JournalSpecialIssuesDataView
  extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW public. ${this.getViewName()}
TABLESPACE pg_default
AS SELECT j.journal_id,
    j.journal_name,
    j.journal_issn,
    j.journal_code,
    j.event_date,
    jsi.id::text AS special_issue_id,
    jsi.name AS special_issue_name,
    jsi.customid AS special_issue_custom_id,
    cast_to_timestamp(jsi.enddate) AS closed_date,
    cast_to_timestamp(jsi.startdate) AS open_date,
        CASE
            WHEN jsi.isactive::boolean = true THEN 'open'::text
            WHEN jsi.iscancelled::boolean = true THEN 'cancelled'::text
            ELSE 'closed'::text
        END AS status,
    NULL::text AS section_id,
    NULL::text AS section_name,
    jsi.editors_json
   FROM ${journalsView.getViewName()} j
     JOIN journal_specialissue jsi ON j.event_id = jsi.event_id AND j.journal_id::uuid = jsi.journal_id
UNION ALL
 SELECT js.journal_id::text AS journal_id,
    js.journal_name,
    js.journal_issn,
    js.journal_code,
    js.event_time AS event_date,
    jssi.id::text AS special_issue_id,
    jssi.name AS special_issue_name,
    jssi.customid AS special_issue_custom_id,
    cast_to_timestamp(jssi.enddate) AS closed_date,
    cast_to_timestamp(jssi.startdate) AS open_date,
        CASE
            WHEN jssi.isactive::boolean = true THEN 'open'::text
            WHEN jssi.iscancelled::boolean = true THEN 'cancelled'::text
            ELSE 'closed'::text
        END AS status,
    js.id::text AS section_id,
    js.name AS section_name,
    jssi.editors_json
   FROM ${journalsView.getViewName()} j
     JOIN journal_section js ON j.event_id = js.event_id
     JOIN journal_section_specialissue jssi ON js.event_id = jssi.event_id AND js.id = jssi.journal_section_id
WITH NO DATA;
    `;
  }

  postCreateQueries = [
    `CREATE INDEX a11_${this.getViewName()}_event_date_idx ON public.${this.getViewName()} USING btree (event_date)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_code_idx ON public.${this.getViewName()} USING btree (journal_code)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_id_idx ON public.${this.getViewName()} USING btree (journal_id)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_issn_idx ON public.${this.getViewName()} USING btree (journal_issn)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_name_idx ON public.${this.getViewName()} USING btree (journal_name)`,
    `CREATE INDEX a11_${this.getViewName()}_special_issue_id_idx ON public.${this.getViewName()} USING btree (special_issue_id)`,
    `CREATE INDEX a11_${this.getViewName()}_special_issue_name_idx ON public.${this.getViewName()} USING btree (special_issue_name)`,
    `CREATE INDEX a11_${this.getViewName()}_special_issuecustomid_idx ON public.${this.getViewName()} USING btree (special_issue_custom_id)`,
  ];

  getViewName(): string {
    return 'journal_special_issues_data';
  }

  getSpecialViewFields(): string {
    return 'id text, name text, "isActive" bool, "isCancelled" bool, "endDate" text, "startDate" text, "cancelReason" text, created text, updated text, "customId" text, editors jsonb';
  }
}

const journalSpecialIssuesDataView = new JournalSpecialIssuesDataView();
journalSpecialIssuesDataView.addDependency(journalsView);

export default journalSpecialIssuesDataView;
