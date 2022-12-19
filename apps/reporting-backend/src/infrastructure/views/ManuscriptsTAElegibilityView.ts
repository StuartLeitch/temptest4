import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';

class ManuscriptsTAElegibilityView extends AbstractEventView implements EventViewContract {
  getCreateQuery(): string {
    return `
    CREATE MATERIALIZED VIEW public.manuscripts_ta_elegibility
    TABLESPACE pg_default
    AS 
    select manuscript_custom_id, last_updated_on, eligibility_type, eligibility_status, discount_ta_code, discount_value, discount_currency, approval_status, approval_reason, approval_decline_reason_text
    , approval_decision_time, approval_updated_by, approval_funding_statement, approval_override_funder_statement, approval_include_funder_statement, approval_absolute_discount_currency, approval_absolute_discount_value
    , approval_percentage_discount_value
    from
    (
    select row_number() over(partition by approval_customid order by approval_customid, event_time desc nulls last) as rn, submission_id, approval_customid as manuscript_custom_id, event_time as last_updated_on
    , eligibilitytype as eligibility_type, eligibilitystatus as eligibility_status, discounts_tacode as discount_ta_code, discounts_value as discount_value, discounts_currency as discount_currency, approval_status
    , approval_reason, approval_declinereasontext as approval_decline_reason_text, cast_to_timestamp(approval_decisiontime) as approval_decision_time, approval_updatedby as approval_updated_by
    , approval_fundingstatementtext as approval_funding_statement, approval_overridefunderstatementtext as approval_override_funder_statement, approval_includefunderstatementtext as approval_include_funder_statement
    , approval_absolutediscount_currency as approval_absolute_discount_currency, approval_absolutediscount_value as approval_absolute_discount_value
    , approval_percentagediscount_value as approval_percentage_discount_value, created, updated
    FROM public.invoice_manuscript_ta_elegibility
    ) ta_elegibility
    where rn=1
    WITH DATA;

    `;
  }

  postCreateQueries = [
    `CREATE INDEX a11_manuscripts_ta_elegibility_manuscript_custom_id_idx ON public.manuscripts_ta_elegibility USING btree (manuscript_custom_id);
    `
  ];

  getViewName(): string {
    return 'manuscripts_ta_elegibility';
  }
}

const manuscriptsTAElegibilityView = new ManuscriptsTAElegibilityView();

export default manuscriptsTAElegibilityView;
