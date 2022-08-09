import { REPORTING_TABLES } from 'libs/shared/src/lib/modules/reporting/constants';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import journalsView from './JournalsView';

class JournalEditorialBoardView
  extends AbstractEventView
  implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW public.${this.getViewName()}
TABLESPACE pg_default
AS SELECT j.journal_id,
    j.journal_name,
    j.section_id,
    j.section_name,
    j.special_issue_id,
    j.special_issue_name,
    j.email,
    j.givennames AS given_names,
    j.surname,
    j.aff,
    j.status,
    j.roletype AS role_type,
    j.rolelabel AS role_label,
    cast_to_timestamp(j.inviteddate) AS invited_date,
    cast_to_timestamp(j.assigneddate) AS assigned_date,
    j.country,
    j.iscorresponding::boolean AS is_corresponding,
    j.userid AS user_id
   FROM ( SELECT j_1.journal_id,
            j_1.journal_name,
            NULL::text AS section_id,
            NULL::text AS section_name,
            NULL::text AS special_issue_id,
            NULL::text AS special_issue_name,
            je.inviteddate,
            je.assigneddate,
            je.status,
            je.email,
            je.country,
            je.iscorresponding,
            je.userid,
            je.givennames,
            je.surname,
            je.aff,
            je.roletype,
            je.rolelabel
           FROM ${journalsView.getViewName()} j_1
             JOIN journal_editor je ON je.event_id = j_1.event_id
        UNION ALL
         SELECT js.journal_id::text AS journal_id,
            js.journal_name,
            js.id::text AS section_id,
            js.name AS section_name,
            NULL::text AS special_issue_id,
            NULL::text AS special_issue_name,
            jse.inviteddate,
            jse.assigneddate,
            jse.status,
            jse.email,
            jse.country,
            jse.iscorresponding,
            jse.userid,
            jse.givennames,
            jse.surname,
            jse.aff,
            jse.roletype,
            jse.rolelabel
           FROM ${journalsView.getViewName()} j_2
             JOIN journal_section js ON j_2.event_id = js.event_id
             JOIN journal_section_editor jse ON js.event_id = jse.event_id AND js.id = jse.journal_section_id
        UNION ALL
         SELECT j_3.journal_id,
            j_3.journal_name,
            NULL::text AS section_id,
            NULL::text AS section_name,
            jsi.id::text AS special_issue_id,
            jsi.name AS special_issue_name,
            jsie.inviteddate,
            jsie.assigneddate,
            jsie.status,
            jsie.email,
            jsie.country,
            jsie.iscorresponding,
            jsie.userid,
            jsie.givennames,
            jsie.surname,
            jsie.aff,
            jsie.roletype,
            jsie.rolelabel
           FROM ${journalsView.getViewName()} j_3
             JOIN journal_specialissue jsi ON j_3.event_id = jsi.event_id
             JOIN journal_specialissue_editor jsie ON jsi.event_id = jsie.event_id AND jsi.id = jsie.journal_specialissue_id
        UNION ALL
         SELECT j_4.journal_id,
            j_4.journal_name,
            js.id::text AS section_id,
            js.name AS section_name,
            jssi.id::text AS special_issue_id,
            jssi.name AS special_issue_name,
            jssie.inviteddate,
            jssie.assigneddate,
            jssie.status,
            jssie.email,
            jssie.country,
            jssie.iscorresponding,
            jssie.userid,
            jssie.givennames,
            jssie.surname,
            jssie.aff,
            jssie.roletype,
            jssie.rolelabel
           FROM ${journalsView.getViewName()} j_4
             JOIN journal_section js ON j_4.event_id = js.event_id AND js.journal_id = j_4.journal_id::uuid
             JOIN journal_section_specialissue jssi ON js.event_id = jssi.event_id AND jssi.journal_section_id = js.id
             JOIN journal_section_specialissue_editor jssie ON jssi.event_id = jssie.event_id AND jssi.id = jssie.journal_section_specialissue_id) j
WITH NO DATA;
`;
  }

  postCreateQueries = [
	`CREATE INDEX a11_${this.getViewName()}_email_idx ON public.${this.getViewName()} USING btree (email)`,
	`CREATE INDEX a11_${this.getViewName()}_invited_date_idx ON public.${this.getViewName()} USING btree (invited_date DESC)`,
	`CREATE INDEX a11_${this.getViewName()}_invited_date_special_issue_id ON public.${this.getViewName()} USING btree (invited_date DESC, special_issue_id)`,
	`CREATE INDEX a11_${this.getViewName()}_journal_id_idx ON public.${this.getViewName()} USING btree (journal_id)`,
	`CREATE UNIQUE INDEX a11_${this.getViewName()}_journal_id_unique_idx ON public.${this.getViewName()} USING btree (journal_id, section_id, special_issue_id, user_id, role_type, status)`,
	`CREATE INDEX a11_${this.getViewName()}_role_type_idx ON public.${this.getViewName()} USING btree (role_type)`,
	`CREATE INDEX a11_${this.getViewName()}_section_id_idx ON public.${this.getViewName()} USING btree (section_id)`,
	`CREATE INDEX a11_${this.getViewName()}_special_issue_id_idx ON public.${this.getViewName()} USING btree (special_issue_id)`
  ];

  getViewName(): string {
    return 'journal_editorial_board';
  }
}

const journalEditorialBoardView = new JournalEditorialBoardView();

journalEditorialBoardView.addDependency(journalsView);

export default journalEditorialBoardView;
