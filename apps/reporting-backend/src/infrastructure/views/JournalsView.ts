import acceptanceRatesView from './AcceptanceRatesView';
import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';
import journalsDataView from './JournalsDataView';

class JournalsView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
CREATE MATERIALIZED VIEW public.${this.getViewName()}
TABLESPACE pg_default
AS SELECT j1.event,
    j1.journal_id,
    j1.journal_issn,
    j1.journal_name,
    j1.peer_review_model,
    COALESCE(publisher.publisher_name, j1.publisher_name, 'Hindawi'::text) AS publisher_name,
    j1.is_active,
    j1.journal_code,
    j1.journal_email,
    j2.apc,
    j1.event_date,
    j1.event_id,
    individual_ar.journal_rate AS current_journal_acceptance_rate,
    global_ar.journal_rate AS current_global_acceptance_rate
   FROM ( SELECT jd.event_id,
            jd.event,
            jd.journal_id,
            jd.journal_issn,
            jd.journal_name,
            jd.is_active,
            jd.journal_code,
            jd.apc,
            jd.journal_email,
            jd.publisher_name,
            jd.peer_review_model,
            jd.event_date,
            jd.updated_date,
            row_number() OVER (PARTITION BY jd.journal_id ORDER BY jd.event_date DESC NULLS LAST) AS rn
           FROM ${journalsDataView.getViewName()} jd) j1
     LEFT JOIN journal_to_publisher publisher ON j1.journal_id = publisher.journal_id
     left join (select * from (
                      select id as journal_id, apc, event_time, created, updated
                        , row_number() OVER(partition by id order by event_time desc nulls last, updated::timestamp desc nulls last) as rn
                      from journal_apc
                ) japc where rn=1) j2 on j1.journal_id=j2.journal_id::text
     LEFT JOIN ( SELECT ${acceptanceRatesView.getViewName()}.journal_id,
            ${acceptanceRatesView.getViewName()}.month,
            avg(${acceptanceRatesView.getViewName()}.journal_rate) AS journal_rate
           FROM ${acceptanceRatesView.getViewName()}
          GROUP BY ${acceptanceRatesView.getViewName()}.journal_id, ${acceptanceRatesView.getViewName()}.month) individual_ar ON individual_ar.month = to_char(now(), 'YYYY-MM-01'::text)::date AND j1.journal_id = individual_ar.journal_id
     LEFT JOIN ( SELECT ${acceptanceRatesView.getViewName()}.month,
            avg(${acceptanceRatesView.getViewName()}.journal_rate) AS journal_rate
           FROM ${acceptanceRatesView.getViewName()}
          WHERE ${acceptanceRatesView.getViewName()}.journal_rate IS NOT NULL
          GROUP BY ${acceptanceRatesView.getViewName()}.month) global_ar ON global_ar.month = to_char(now(), 'YYYY-MM-01'::text)::date
  WHERE j1.rn = 1
WITH NO DATA;
    `;
  }

  postCreateQueries = [
    `CREATE INDEX a11_${this.getViewName()}_journal_code_idx ON public.journals USING btree (journal_code)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_id_event_date_idx ON public.journals USING btree (journal_id, event_date)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_id_idx ON public.journals USING btree (journal_id)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_issn_idx ON public.journals USING btree (journal_issn)`,
    `CREATE INDEX a11_${this.getViewName()}_journal_name_idx ON public.journals USING btree (journal_name)`,
    `CREATE INDEX a11_${this.getViewName()}_publisher_name_idx ON public.journals USING btree (publisher_name)`,
  ];

  getViewName(): string {
    return 'journals';
  }
}

const journalsView = new JournalsView();
journalsView.addDependency(journalsDataView);

export default journalsView;
