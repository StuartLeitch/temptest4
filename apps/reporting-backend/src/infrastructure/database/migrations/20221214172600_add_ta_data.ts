import * as Knex from 'knex';
import ManuscriptsTAElegibilityView from '../../views/ManuscriptsTAElegibilityView';

const create_manuscripts_screener_email_table_index = `
CREATE INDEX IF NOT EXISTS a11_manuscripts_screener_email_idx ON public.manuscripts USING btree (screener_email);
`;

const create_invoice_manuscript_ta_elegibility_table = `
create table public.invoice_manuscript_ta_elegibility
(
	event_id uuid null,
	event_time timestamptz NULL,
	event_type varchar(255) NULL,
	id uuid NULL,
	submission_id uuid null,
	eligibilitytype text null,
	eligibilitystatus text null,
	discounts_tacode text null,
	discounts_value text null,
	discounts_currency text null,
	approval_customid text null,
	approval_status text null,
	approval_reason text null,
	approval_declinereasontext text null,
	approval_decisiontime text NULL,
	approval_updatedby text null,
	approval_fundingstatementtext text null,
	approval_overridefunderstatementtext text null,
	approval_includefunderstatementtext text null,
	approval_absolutediscount_currency text null,
	approval_absolutediscount_value text null,
	approval_percentagediscount_value text null,
	created text null,
	updated text null
);

CREATE INDEX invoice_manuscript_ta_elegibility_event_id_index ON public.invoice_manuscript_ta_elegibility USING btree (event_id);
CREATE INDEX invoice_manuscript_ta_elegibility_approval_customid_idx ON public.invoice_manuscript_ta_elegibility (approval_customid);
CREATE INDEX invoice_manuscript_ta_elegibility_event_time_idx ON public.invoice_manuscript_ta_elegibility (event_time);
`;

const sp_insert_into_invoice_tables = `
CREATE OR REPLACE FUNCTION public.insert_into_invoice_tables()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
begin

	if (new.type in ('ManuscriptTAEligibilityUpdated')) then
	insert into public.invoice_manuscript_ta_elegibility
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as id,
			uuid(NEW.payload -> 'data' ->> 'submissionId') as submissionId,
			NEW.payload -> 'data' ->> 'eligibilityType' as eligibilitytype,
			NEW.payload -> 'data' ->> 'eligibilityStatus' as eligibilitystatus,
			NEW.payload -> 'data' -> 'discounts' ->> 'taCode' as discounts_tacode,
			NEW.payload -> 'data' -> 'discounts' ->> 'value' as discounts_value,
			NEW.payload -> 'data' -> 'discounts' ->> 'currency' as discounts_currency,
			NEW.payload -> 'data' -> 'approval' ->> 'customId' as approval_customid,
			NEW.payload -> 'data' -> 'approval' ->> 'status' as approval_status,
			NEW.payload -> 'data' -> 'approval' ->> 'reason' as approval_reason,
			NEW.payload -> 'data' -> 'approval' ->> 'declineReasonText' as approval_declinereasontext,
			NEW.payload -> 'data' -> 'approval' ->> 'decisionTime' as approval_decisiontime,
			NEW.payload -> 'data' -> 'approval' ->> 'updatedBy' as approval_updatedby,
			NEW.payload -> 'data' -> 'approval' ->> 'fundingStatementText' as approval_fundingstatementtext,
			NEW.payload -> 'data' -> 'approval' ->> 'overrideFunderStatementText' as approval_overridefunderstatementtext,
			NEW.payload -> 'data' -> 'approval' ->> 'includeFunderStatementText' as approval_includefunderstatementtext,
			NEW.payload -> 'data' -> 'approval' -> 'absoluteDiscount' ->> 'currency' as approval_absolutediscountcurrency,
			NEW.payload -> 'data' -> 'approval' -> 'absoluteDiscount' ->> 'value' as approval_absolutediscountvalue,
			NEW.payload -> 'data' -> 'approval' -> 'percentageDiscount' ->> 'value' as approval_percentagediscountvalue,
			NEW.payload ->>'created' as created,
			NEW.payload ->>'updated' as updated 
			;	
		RETURN NEW;	
	end if;

	--create table public.invoice as select * from public.invoice limit 0;
	insert into public.invoice
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as id,
			
			NEW.payload ->>'created' as created,
			NEW.payload ->>'updated' as updated,
			NEW.payload ->>'invoiceId' as invoiceId,
			NEW.payload ->>'erpReference' as erpReference,
			NEW.payload ->>'isCreditNote' isCreditNote,
			NEW.payload ->>'invoiceStatus' as invoiceStatus,
			NEW.payload ->>'preprintValue' as preprintValue,
			NEW.payload ->>'transactionId' as transactionId,
			NEW.payload ->>'lastPaymentDate' as lastPaymentDate,
			NEW.payload ->>'referenceNumber' as referenceNumber,
			NEW.payload ->>'invoiceIssuedDate' as invoiceIssuedDate,
			NEW.payload ->>'invoiceCreatedDate' as invoiceCreatedDate,
			NEW.payload ->>'creditNoteForInvoice' as creditNoteForInvoice,
			NEW.payload ->>'invoiceFinalizedDate' as invoiceFinalizedDate,
			NEW.payload ->>'manuscriptAcceptedDate' as manuscriptAcceptedDate,
			NEW.payload ->>'currency' as currency,
			-- "very" sexy logic inherited from invoices_data
			((NEW.payload -> 'invoiceItems'::text) -> 0) ->> 'manuscriptCustomId'::text AS manuscript_custom_id,
			COALESCE((((NEW.payload -> 'invoiceItems'::text) -> 0) ->> 'vatPercentage'::text)::double precision, 0::double precision) AS vat_percentage,
			((NEW.payload -> 'payments'::text) -> 0) ->> 'paymentType'::text AS payment_type,
			
			NEW.payload ->'costs' ->> 'netApc' as costs_netApc,
			NEW.payload ->'costs' ->> 'grossApc' as costs_grossApc,
			NEW.payload ->'costs' ->> 'dueAmount' as costs_dueAmount,
			NEW.payload ->'costs' ->> 'netAmount' as costs_netAmount,
			NEW.payload ->'costs' ->> 'vatAmount' as costs_vatAmount,
			NEW.payload ->'costs' ->> 'paidAmount' as costs_paidAmount,
			NEW.payload ->'costs' ->> 'totalDiscount' as costs_totalDiscount,
			
			NEW.payload ->'payer' ->> 'type'::text as payer_type,
			NEW.payload ->'payer' ->> 'email'::text as payer_email,
			NEW.payload ->'payer' ->> 'lastName'::text as payer_lastName,
			NEW.payload ->'payer' ->> 'firstName'::text as payer_firstName,
			NEW.payload ->'payer' ->> 'countryCode'::text as payer_countryCode,
			NEW.payload ->'payer' ->> 'organization'::text as payer_organization,
			NEW.payload ->'payer' ->> 'billingAddress'::text as payer_billingAddress,
			NEW.payload ->'payer' ->> 'vatRegistrationNumber'::text as payer_vatRegistrationNumber	 
			;
	
	--create table public.invoice_payment as select * from public.invoice_payment limit 0;
	insert into public.invoice_payment
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as invoice_id,
			
			ip ->> 'paymentDate' as paymentDate,
			ip ->> 'paymentType' as paymentType,
			ip ->> 'paymentAmount' as paymentAmount,
			ip ->> 'foreignPaymentId' as foreignPaymentId
		from 
			jsonb_array_elements(NEW.payload ->'payments') ip;
		
		
	--create table public.invoice_invoiceItem as select * from public.invoice_invoiceItem limit 0;
	insert into public.invoice_invoiceItem
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as invoice_id,
			
			ii ->> 'id' as id,
			ii ->> 'type' as type,
			ii ->> 'price' as price,
			ii ->> 'manuscriptId' as manuscriptId,
			ii ->> 'vatPercentage' vatPercentage,
			ii ->> 'manuscriptCustomId' as manuscriptCustomId
		from 
			jsonb_array_elements(NEW.payload ->'invoiceItems') ii;
	
	
	--create table public.invoice_invoiceItem_coupon as select * from public.invoice_invoiceItem_coupon limit 0;
	insert into public.invoice_invoiceItem_coupon
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as invoice_id,
			ii ->> 'id' as invoice_lineItem_id,
			iic ->> 'id' as id,
			iic ->> 'code' as code,
			iic ->> 'couponType' as couponType,
			iic ->> 'couponReduction' as couponReduction,
			iic ->> 'couponCreatedDate' as couponCreatedDate,
			iic ->> 'couponUpdatedDate' as couponUpdatedDate,
			iic ->> 'couponExpirationDate' as couponExpirationDate,
			iic ->> 'applicableToInvoiceItemType' as applicableToInvoiceItemType
		from 
			jsonb_array_elements(NEW.payload ->'invoiceItems') ii,
			jsonb_array_elements(ii.value ->'coupons') iic;
		
	
	--create table public.invoice_invoiceItem_waiver as select * from public.invoice_invoiceItem_waiver limit 0;
	insert into public.invoice_invoiceItem_waiver
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as invoice_id,
			ii ->> 'id' as invoice_lineItem_id,
			iiw ->> 'waiverType' as waiverType,
			iiw ->> 'waiverReduction' as waiverReduction
		from 
			jsonb_array_elements(NEW.payload ->'invoiceItems') ii,
			jsonb_array_elements(ii.value ->'waivers') iiw;	
		
	RETURN NEW;
	END
$function$
;
`;

const refresh_all_materialized_views_sp = `
CREATE OR REPLACE PROCEDURE public.refresh_all_materialized_views()
 LANGUAGE plpgsql
AS $procedure$
DECLARE
	vStartTimeProcedure timestamp;
	vStartTime timestamp;
	vRefreshId uuid;
BEGIN
	vStartTimeProcedure = clock_timestamp();

	vRefreshId = md5(random()::text || clock_timestamp()::text)::uuid;


	if (select date_part('minute', current_time)) > 0 then
		call public.sp_log(vRefreshId, clock_timestamp(), 'Skipping: can only run at the start of the hour!', clock_timestamp() - vStartTime);
		commit;
		return;
	end if;


	call public.sp_log(vRefreshId, clock_timestamp(), 'public.refresh_mat_views_log start');

	vStartTime = clock_timestamp();
	refresh materialized view public.manuscripts_ta_elegibility;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscripts_ta_elegibility', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.journals_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'journals_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.journals;
	call public.sp_log(vRefreshId, clock_timestamp(), 'journals', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.journal_sections;
	call public.sp_log(vRefreshId, clock_timestamp(), 'journal_sections', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.journal_special_issues_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'journal_special_issues_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view concurrently public.journal_editorial_board;
	call public.sp_log(vRefreshId, clock_timestamp(), 'journal_editorial_board', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.checker_submission_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'checker_submission_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.peer_review_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'peer_review_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.journal_special_issues;
	call public.sp_log(vRefreshId, clock_timestamp(), 'journal_special_issues', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.checker_to_submission;
	call public.sp_log(vRefreshId, clock_timestamp(), 'checker_to_submission', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.checker_team_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'checker_team_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	call public.sp_refresh_submissions_as_table();
	call public.sp_log(vRefreshId, clock_timestamp(), '_submissions', clock_timestamp() - vStartTime);
	vStartTime = clock_timestamp();
	refresh materialized view public.submissions;
	call public.sp_log(vRefreshId, clock_timestamp(), 'submissions', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	call public.sp_refresh_authors_as_table();
	call public.sp_log(vRefreshId, clock_timestamp(), '_authors', clock_timestamp() - vStartTime);
	vStartTime = clock_timestamp();
	refresh materialized view concurrently public.authors;
	call public.sp_log(vRefreshId, clock_timestamp(), 'authors', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.article_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'article_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view concurrently public.invoices_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'invoices_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view concurrently public.manuscript_reviewers;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscript_reviewers', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	call public.sp_refresh_manuscript_editors_as_table();
	call public.sp_log(vRefreshId, clock_timestamp(), '_manuscript_editors', clock_timestamp() - vStartTime);
	vStartTime = clock_timestamp();
	refresh materialized view concurrently public.manuscript_editors;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscript_editors', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.payments;
	call public.sp_log(vRefreshId, clock_timestamp(), 'payments', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view concurrently public.manuscript_reviews;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscript_reviews', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	call public.sp_refresh_invoices_as_table();
	call public.sp_log(vRefreshId, clock_timestamp(), '_invoices', clock_timestamp() - vStartTime);
	vStartTime = clock_timestamp();
	refresh materialized view public.invoices;
	call public.sp_log(vRefreshId, clock_timestamp(), 'invoices', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.users_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'users_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	call public.sp_refresh_manuscripts_as_table();
	call public.sp_log(vRefreshId, clock_timestamp(), '_manuscripts', clock_timestamp() - vStartTime);
	vStartTime = clock_timestamp();
	refresh materialized view concurrently public.manuscripts;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscripts', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.checker_to_team;
	call public.sp_log(vRefreshId, clock_timestamp(), 'checker_to_team', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.manuscript_users;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscript_users', clock_timestamp() - vStartTime);
	commit;
	
	call public.sp_log(vRefreshId, clock_timestamp(), 'public.refresh_mat_views_log end', clock_timestamp() - vStartTimeProcedure);

END
$procedure$
;
`

export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(create_manuscripts_screener_email_table_index),
	  knex.raw(create_invoice_manuscript_ta_elegibility_table),
	  knex.raw(sp_insert_into_invoice_tables),
	  knex.raw(refresh_all_materialized_views_sp),
	]);
  }
  
export async function down(knex: Knex): Promise<any> {
	return Promise.all([
        //knex.raw(sp_refresh_manuscripts_as_table_migration_rollback),
      ]);
  }

export const updatedMaterializedViews = 
[
	ManuscriptsTAElegibilityView,
];

export const name = '20221214172600_add_ta_data';