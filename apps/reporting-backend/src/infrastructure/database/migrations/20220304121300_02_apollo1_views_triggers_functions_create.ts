import * as Knex from 'knex';

const viewsTriggersFunctionsCreate = `
--------------------------------------CREATE VIEWS, TRIGGERS, TRIGGER FUNCTIONS------------------------------------------------------------------------------
-- ///////////////////////////////////////////////////////////////////////////
-- CREATE STRUCTURE FOR _submissions, _manuscripts AND _invoices
-- ///////////////////////////////////////////////////////////////////////////

CREATE OR REPLACE PROCEDURE public.sp_create_submissions_manuscripts_invoices_as_tables(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

	CREATE UNLOGGED TABLE IF NOT EXISTS public._invoices
	(
		invoice_reference_number text COLLATE pg_catalog."default",
		credited_invoice_reference_number text COLLATE pg_catalog."default",
		is_credit_note boolean,
		is_deleted boolean,
		deleted_date timestamp with time zone,
		manuscript_custom_id text COLLATE pg_catalog."default",
		invoice_created_date timestamp without time zone,
		invoice_sent_date timestamp without time zone,
		invoice_issue_date timestamp without time zone,
		manuscript_accepted_date timestamp with time zone,
		payment_status text COLLATE pg_catalog."default",
		invoice_id text COLLATE pg_catalog."default",
		invoice_status text COLLATE pg_catalog."default",
		gross_apc_value double precision,
		discount double precision,
		net_apc double precision,
		vat_amount double precision,
		net_amount double precision,
		due_amount double precision,
		paid_amount double precision,
		published_date timestamp without time zone,
		payment_date timestamp without time zone,
		payer_given_name text COLLATE pg_catalog."default",
		payer_email text COLLATE pg_catalog."default",
		payment_type text COLLATE pg_catalog."default",
		payer_country text COLLATE pg_catalog."default",
		payer_address text COLLATE pg_catalog."default",
		payment_currency text COLLATE pg_catalog."default",
		organization text COLLATE pg_catalog."default",
		payment_reference text COLLATE pg_catalog."default",
		waivers text COLLATE pg_catalog."default",
		coupons text COLLATE pg_catalog."default",
		event_id uuid,
		manuscript_title text COLLATE pg_catalog."default",
		manuscript_article_type text COLLATE pg_catalog."default",
		journal_name text COLLATE pg_catalog."default",
		publisher_name text COLLATE pg_catalog."default",
		journal_code text COLLATE pg_catalog."default",
		issue_type text COLLATE pg_catalog."default",
		manuscript_submission_date timestamp with time zone,
		apc text COLLATE pg_catalog."default",
		submission_pricing_status text COLLATE pg_catalog."default",
		corresponding_author_name text COLLATE pg_catalog."default",
		corresponding_author_country character varying COLLATE pg_catalog."default",
		corresponding_author_email text COLLATE pg_catalog."default",
		corresponding_author_affiliation text COLLATE pg_catalog."default"
	)
	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public._invoices
		OWNER to postgres;


	CREATE UNLOGGED TABLE IF NOT EXISTS public._manuscripts
	(
		event_id uuid,
		event_timestamp timestamp with time zone,
		submission_id text COLLATE pg_catalog."default",
		manuscript_custom_id text COLLATE pg_catalog."default",
		submission_event character varying(255) COLLATE pg_catalog."default",
		article_type text COLLATE pg_catalog."default",
		version text COLLATE pg_catalog."default",
		manuscript_version_id text COLLATE pg_catalog."default",
		title text COLLATE pg_catalog."default",
		last_version_index integer,
		special_issue_id text COLLATE pg_catalog."default",
		section_id text COLLATE pg_catalog."default",
		submission_date timestamp with time zone,
		screening_passed_date timestamp with time zone,
		last_recommendation_date timestamp with time zone,
		last_returned_to_draft_date timestamp with time zone,
		screening_returned_to_draft_count bigint,
		last_returned_to_editor_date timestamp with time zone,
		last_revision_submitted timestamp with time zone,
		sent_to_quality_check_date timestamp with time zone,
		sent_to_materials_check_date timestamp with time zone,
		first_decision_date timestamp with time zone,
		last_materials_check_files_requested_date timestamp with time zone,
		materials_check_files_requested_count bigint,
		last_materials_check_files_submitted_date timestamp with time zone,
		materials_check_files_submitted_count bigint,
		screening_paused_date timestamp with time zone,
		screening_unpaused_date timestamp with time zone,
		qc_paused_date timestamp with time zone,
		qc_unpaused_date timestamp with time zone,
		qc_escalated_date timestamp with time zone,
		peer_review_cycle_check_date timestamp with time zone,
		accepted_date timestamp with time zone,
		void_date timestamp with time zone,
		is_void boolean,
		resubmission_date timestamp with time zone,
		section_name text COLLATE pg_catalog."default",
		special_issue_name text COLLATE pg_catalog."default",
		preprint_value text COLLATE pg_catalog."default",
		journal_id text COLLATE pg_catalog."default",
		journal_name text COLLATE pg_catalog."default",
		journal_apc text COLLATE pg_catalog."default",
		publisher_name text COLLATE pg_catalog."default",
		journal_code text COLLATE pg_catalog."default",
		source_journal text COLLATE pg_catalog."default",
		deleted boolean,
		last_event_type character varying(255) COLLATE pg_catalog."default",
		last_event_date timestamp with time zone,
		final_decision_date timestamp with time zone,
		final_decision_type character varying(255) COLLATE pg_catalog."default",
		apc text COLLATE pg_catalog."default",
		submission_pricing_status text COLLATE pg_catalog."default",
		published_date timestamp without time zone,
		gross_apc double precision,
		discount double precision,
		net_apc double precision,
		paid_amount double precision,
		due_amount double precision,
		coupons text COLLATE pg_catalog."default",
		waivers text COLLATE pg_catalog."default",
		issue_type text COLLATE pg_catalog."default",
		acceptance_chance numeric,
		special_issue text COLLATE pg_catalog."default",
		special_issue_custom_id text COLLATE pg_catalog."default",
		special_issue_open_date timestamp without time zone,
		special_issue_closed_date timestamp without time zone,
		si_lead_guest_editor_name text COLLATE pg_catalog."default",
		si_lead_guest_editor_email text COLLATE pg_catalog."default",
		si_lead_guest_editor_affiliation text COLLATE pg_catalog."default",
		si_lead_guest_editor_country text COLLATE pg_catalog."default",
		si_guest_editor_count bigint,
		section text COLLATE pg_catalog."default",
		corresponding_author text COLLATE pg_catalog."default",
		corresponding_author_email text COLLATE pg_catalog."default",
		corresponding_author_country character varying COLLATE pg_catalog."default",
		corresponding_author_affiliation text COLLATE pg_catalog."default",
		submitting_author text COLLATE pg_catalog."default",
		submitting_author_email text COLLATE pg_catalog."default",
		submitting_author_country character varying COLLATE pg_catalog."default",
		submitting_author_affiliation text COLLATE pg_catalog."default",
		triage_editor text COLLATE pg_catalog."default",
		triage_editor_email text COLLATE pg_catalog."default",
		triage_editor_country text COLLATE pg_catalog."default",
		triage_editor_affiliation text COLLATE pg_catalog."default",
		handling_editor text COLLATE pg_catalog."default",
		handling_editor_email text COLLATE pg_catalog."default",
		handling_editor_country text COLLATE pg_catalog."default",
		handling_editor_affiliation text COLLATE pg_catalog."default",
		handling_editor_invited_date timestamp without time zone,
		editorial_assistant text COLLATE pg_catalog."default",
		editorial_assistant_email text COLLATE pg_catalog."default",
		editorial_assistant_country text COLLATE pg_catalog."default",
		editorial_assistant_affiliation text COLLATE pg_catalog."default",
		screener_name text COLLATE pg_catalog."default",
		screener_email text COLLATE pg_catalog."default",
		quality_checker_name text COLLATE pg_catalog."default",
		quality_checker_email text COLLATE pg_catalog."default",
		is_paused boolean,
		is_quality_check_paused boolean,
		invited_reviewers_count bigint,
		last_reviewer_invitation_date timestamp without time zone,
		first_reviewer_invitation_date timestamp without time zone,
		reviewer_count bigint,
		accepted_reviewers_count bigint,
		last_reviewer_accepted_date timestamp without time zone,
		first_reviewer_accepted_date timestamp without time zone,
		pending_reviewers_count bigint,
		review_reports_count bigint,
		last_review_report_submitted_date timestamp without time zone,
		first_review_report_submitted_date timestamp without time zone,
		invited_handling_editors_count bigint,
		last_handling_editor_invited_date timestamp without time zone,
		current_handling_editor_accepted_date timestamp without time zone,
		last_handling_editor_declined_date timestamp without time zone,
		first_handling_editor_invited_date timestamp without time zone,
		first_handling_editor_accepted_date timestamp without time zone,
		last_editor_recommendation text COLLATE pg_catalog."default",
		last_editor_recommendation_submitted_date timestamp without time zone,
		last_requested_revision_date timestamp with time zone,
		current_expected_revenue double precision,
		raw_expected_revenue double precision
	)
	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public._manuscripts
		OWNER to postgres;

	CREATE UNLOGGED TABLE IF NOT EXISTS public._submissions
	(
		event_id uuid,
		event_timestamp timestamp with time zone,
		submission_id text COLLATE pg_catalog."default",
		manuscript_custom_id text COLLATE pg_catalog."default",
		submission_event character varying(255) COLLATE pg_catalog."default",
		article_type text COLLATE pg_catalog."default",
		version text COLLATE pg_catalog."default",
		manuscript_version_id text COLLATE pg_catalog."default",
		title text COLLATE pg_catalog."default",
		last_version_index integer,
		special_issue_id text COLLATE pg_catalog."default",
		section_id text COLLATE pg_catalog."default",
		submission_date timestamp with time zone,
		screening_passed_date timestamp with time zone,
		last_recommendation_date timestamp with time zone,
		last_returned_to_draft_date timestamp with time zone,
		screening_returned_to_draft_count bigint,
		last_returned_to_editor_date timestamp with time zone,
		last_revision_submitted timestamp with time zone,
		sent_to_quality_check_date timestamp with time zone,
		sent_to_materials_check_date timestamp with time zone,
		first_decision_date timestamp with time zone,
		last_materials_check_files_requested_date timestamp with time zone,
		materials_check_files_requested_count bigint,
		last_materials_check_files_submitted_date timestamp with time zone,
		materials_check_files_submitted_count bigint,
		screening_paused_date timestamp with time zone,
		screening_unpaused_date timestamp with time zone,
		qc_paused_date timestamp with time zone,
		qc_unpaused_date timestamp with time zone,
		qc_escalated_date timestamp with time zone,
		peer_review_cycle_check_date timestamp with time zone,
		accepted_date timestamp with time zone,
		void_date timestamp with time zone,
		is_void boolean,
		resubmission_date timestamp with time zone,
		section_name text COLLATE pg_catalog."default",
		special_issue_name text COLLATE pg_catalog."default",
		preprint_value text COLLATE pg_catalog."default",
		journal_id text COLLATE pg_catalog."default",
		journal_name text COLLATE pg_catalog."default",
		journal_apc text COLLATE pg_catalog."default",
		publisher_name text COLLATE pg_catalog."default",
		journal_code text COLLATE pg_catalog."default",
		source_journal text COLLATE pg_catalog."default"
	)
	TABLESPACE pg_default;

	ALTER TABLE IF EXISTS public._submissions
		OWNER to postgres;
end;
$BODY$;



-- ///////////////////////////////////////////////////////////////////////////
-- CREATE MATERIALIZED VIEWS
-- ///////////////////////////////////////////////////////////////////////////

-- PROCEDURE: public.create_article_data()

-- DROP PROCEDURE IF EXISTS public.create_article_data();

CREATE OR REPLACE PROCEDURE public.create_article_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.article_data
TABLESPACE pg_default
AS
SELECT article.event_id,
	article.event_time AS event_timestamp,
	article.event_type AS event,
	article.title,
	cast_to_timestamp(article.published) AS published_date,
	article.customid AS manuscript_custom_id,
	NULL::text AS submission_id,
	article.doi,
	article.volume,
	article.figcount::integer AS fig_count,
	article.refcount::integer AS ref_count,
	article.journalid AS journal_id,
	article.pagecount::integer AS page_count,
	article.hassupplementarymaterials::boolean AS has_supplementary_materials
FROM public.article
WITH NO DATA;

ALTER TABLE public.article_data
	OWNER TO postgres;

GRANT ALL ON TABLE public.article_data TO postgres;
GRANT SELECT ON TABLE public.article_data TO superset_ro;

CREATE INDEX a11_article_data_event_id_idx
	ON public.article_data USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_article_data_event_idx
	ON public.article_data USING btree
	(event COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_article_data_event_timestamp_idx
	ON public.article_data USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_article_data_journal_id_idx
	ON public.article_data USING btree
	(journal_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_article_data_manuscript_custom_id_idx
	ON public.article_data USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_article_data_published_date_idx
	ON public.article_data USING btree
	(published_date)
	TABLESPACE pg_default;
CREATE INDEX a11_article_data_submission_id_idx
	ON public.article_data USING btree
	(submission_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
end;
$BODY$;


-- PROCEDURE: public.create_authors()

-- DROP PROCEDURE IF EXISTS public.create_authors();

CREATE OR REPLACE PROCEDURE public.create_authors(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.authors
TABLESPACE pg_default
AS
SELECT a.id::text AS id,
	s.manuscript_custom_id,
	a.email,
	COALESCE(c.name, a.country::character varying) AS country,
	a.iscorresponding::boolean AS is_corresponding,
	a.issubmitting::boolean AS is_submitting,
	a.userid AS user_id,
	a.givennames AS given_names,
	a.surname,
	a.aff,
	s.event_id
--   FROM public.manuscript m
--     JOIN public.submissions s ON m.event_id = s.event_id AND m.id = s.manuscript_version_id::uuid
--     JOIN public.manuscript_author a ON m.event_id = a.event_id AND m.id = a.manuscript_id
--     LEFT JOIN countries c ON upper(a.country) = c.iso::text
FROM public.submissions s 
	INNER JOIN public.manuscript_author a ON s.event_id = a.event_id AND s.manuscript_version_id::uuid = a.manuscript_id
	LEFT JOIN countries c ON upper(a.country) = c.iso::text
WITH NO DATA;

ALTER TABLE public.authors
	OWNER TO postgres;

GRANT ALL ON TABLE public.authors TO postgres;
GRANT SELECT ON TABLE public.authors TO superset_ro;

CREATE INDEX a11_authors_email_idx
	ON public.authors USING btree
	(email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_authors_event_id_idx
	ON public.authors USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_authors_id_idx
	ON public.authors USING btree
	(id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_authors_manuscript_custom_id_idx
	ON public.authors USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_authors_manuscript_custom_id_is_corresponding_idx
	ON public.authors USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", is_corresponding)
	TABLESPACE pg_default;
CREATE INDEX a11_authors_manuscript_custom_id_is_submitting_idx
	ON public.authors USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", is_submitting)
	TABLESPACE pg_default;
	
end;
$BODY$;


-- PROCEDURE: public.create_checker_submission_data()

-- DROP PROCEDURE IF EXISTS public.create_checker_submission_data();

CREATE OR REPLACE PROCEDURE public.create_checker_submission_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.checker_submission_data
TABLESPACE pg_default
AS
SELECT c.event_id,
	COALESCE(c.event_time, cast_to_timestamp(c.updated)::timestamp with time zone, cast_to_timestamp('1980-01-01'::text)::timestamp with time zone) AS event_timestamp,
	c.event_type AS event,
	c.teamid AS team_id,
	c.id::text AS checker_id,
	c.submissionid AS submission_id,
	cast_to_timestamp(c.assignationdate) AS assignation_date,
	(c.givennames || ' '::text) || c.surname AS checker_name,
	c.email AS checker_email,
	c.role AS checker_role,
	c.isconfirmed::boolean AS is_confirmed
FROM public.checker c
WHERE c.event_type::text = ANY (ARRAY['ScreenerAssigned'::character varying::text, 'ScreenerReassigned'::character varying::text, 'QualityCheckerAssigned'::character varying::text, 'QualityCheckerReassigned'::character varying::text])
WITH NO DATA;

ALTER TABLE public.checker_submission_data
	OWNER TO postgres;

GRANT ALL ON TABLE public.checker_submission_data TO postgres;
GRANT SELECT ON TABLE public.checker_submission_data TO superset_ro;

CREATE INDEX a11_checker_submission_data_assignation_date_idx
	ON public.checker_submission_data USING btree
	(assignation_date)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_checker_email_idx
	ON public.checker_submission_data USING btree
	(checker_email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_checker_id_idx
	ON public.checker_submission_data USING btree
	(checker_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_checker_role_idx
	ON public.checker_submission_data USING btree
	(checker_role COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_event_event_timestamp_idx
	ON public.checker_submission_data USING btree
	(event COLLATE pg_catalog."default", event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_event_id_idx
	ON public.checker_submission_data USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_event_idx
	ON public.checker_submission_data USING btree
	(event COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_event_timestamp_idx
	ON public.checker_submission_data USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_s_id_ch_role_assig_date_idx
	ON public.checker_submission_data USING btree
	(submission_id COLLATE pg_catalog."default", checker_role COLLATE pg_catalog."default", assignation_date)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_submission_id_idx
	ON public.checker_submission_data USING btree
	(submission_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_submission_data_team_id_idx
	ON public.checker_submission_data USING btree
	(team_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_checker_team_data()

-- DROP PROCEDURE IF EXISTS public.create_checker_team_data();

CREATE OR REPLACE PROCEDURE public.create_checker_team_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.checker_team_data
TABLESPACE pg_default
AS
SELECT c.event_id,
	COALESCE(c."event_time", cast_to_timestamp(c.updated)::timestamp with time zone, cast_to_timestamp('1980-01-01'::text)::timestamp with time zone) AS event_timestamp,
	c.event_type AS event,
	c.id::text AS team_id,
	c.name AS team_name,
	c.type AS team_type
FROM public.checker c
WHERE c.event_type::text = ANY (ARRAY['CheckerTeamCreated'::character varying::text, 'CheckerTeamUpdated'::character varying::text])
WITH NO DATA;

ALTER TABLE public.checker_team_data
	OWNER TO postgres;

GRANT ALL ON TABLE public.checker_team_data TO postgres;
GRANT SELECT ON TABLE public.checker_team_data TO superset_ro;

CREATE INDEX a11_checker_team_data_event_event_timestamp_idx
	ON public.checker_team_data USING btree
	(event COLLATE pg_catalog."default", event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_team_data_event_id_idx
	ON public.checker_team_data USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_team_data_event_idx
	ON public.checker_team_data USING btree
	(event COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_team_data_event_timestamp_idx
	ON public.checker_team_data USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_team_data_team_id_idx
	ON public.checker_team_data USING btree
	(team_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_team_data_team_type_idx
	ON public.checker_team_data USING btree
	(team_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
end;
$BODY$;


-- PROCEDURE: public.create_checker_to_submission()

-- DROP PROCEDURE IF EXISTS public.create_checker_to_submission();

CREATE OR REPLACE PROCEDURE public.create_checker_to_submission(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.checker_to_submission
TABLESPACE pg_default
AS
SELECT c.event_id,
	c.event_timestamp,
	c.event,
	c.team_id,
	c.checker_id,
	c.submission_id,
	c.assignation_date,
	c.checker_name,
	c.checker_email,
	c.checker_role,
	c.is_confirmed
FROM ( SELECT checker_submission_data.event_id,
			checker_submission_data.event_timestamp,
			checker_submission_data.event,
			checker_submission_data.team_id,
			checker_submission_data.checker_id,
			checker_submission_data.submission_id,
			checker_submission_data.assignation_date,
			checker_submission_data.checker_name,
			checker_submission_data.checker_email,
			checker_submission_data.checker_role,
			checker_submission_data.is_confirmed,
			row_number() OVER (PARTITION BY checker_submission_data.submission_id, checker_submission_data.checker_role ORDER BY checker_submission_data.assignation_date DESC) AS rn
		FROM public.checker_submission_data) c
WHERE c.rn = 1
WITH NO DATA;

ALTER TABLE public.checker_to_submission
	OWNER TO postgres;

GRANT ALL ON TABLE public.checker_to_submission TO postgres;
GRANT SELECT ON TABLE public.checker_to_submission TO superset_ro;

CREATE INDEX a11_checker_to_submission_assignation_date_idx
	ON public.checker_to_submission USING btree
	(assignation_date)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_checker_email_idx
	ON public.checker_to_submission USING btree
	(checker_email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_checker_id_idx
	ON public.checker_to_submission USING btree
	(checker_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_checker_role_idx
	ON public.checker_to_submission USING btree
	(checker_role COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_event_event_timestamp_idx
	ON public.checker_to_submission USING btree
	(event COLLATE pg_catalog."default", event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_event_id_idx
	ON public.checker_to_submission USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_event_idx
	ON public.checker_to_submission USING btree
	(event COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_event_timestamp_idx
	ON public.checker_to_submission USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_submission_id_assignation_date_idx
	ON public.checker_to_submission USING btree
	(submission_id COLLATE pg_catalog."default", assignation_date)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_submission_id_idx
	ON public.checker_to_submission USING btree
	(submission_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_submission_team_id_idx
	ON public.checker_to_submission USING btree
	(team_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;

end;
$BODY$;


-- PROCEDURE: public.create_checker_to_team()

-- DROP PROCEDURE IF EXISTS public.create_checker_to_team();

CREATE OR REPLACE PROCEDURE public.create_checker_to_team(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.checker_to_team
TABLESPACE pg_default
AS
SELECT ce.id::text AS checker_id,
	(ce."givennames" || ' '::text) || ce.surname AS checker_name,
	ce."isconfirmed"::boolean AS is_confirmed,
	ce.email AS checker_email,
	ce.role as checker_role,
	cast_to_timestamp(ce.created) AS created_date,
	cast_to_timestamp(ce.updated) AS updated_date,
	c.event_id,
	c.event_timestamp,
	c.event,
	c.team_id,
	c.team_name,
	c.team_type
FROM ( SELECT checker_team_data.event_id,
			checker_team_data.event_timestamp,
			checker_team_data.event,
			checker_team_data.team_id,
			checker_team_data.team_name,
			checker_team_data.team_type,
			row_number() OVER (PARTITION BY checker_team_data.team_id ORDER BY checker_team_data.event_timestamp DESC) AS rn
		FROM public.checker_team_data) c
	JOIN ( SELECT cc.email,
				cc.role,
				cc.id,
				cc.surname,
				cc."givennames" AS givenNames,
				cc.created,
				cc.updated,
				cc."isconfirmed" AS isConfirmed,
				cc.event_id
			FROM public.checker_checker cc
			UNION ALL
			SELECT tl.email,
				'leader' as role,
				tl.id,
				tl.surname,
				tl."givennames" AS givenNames,
				tl.created,
				tl.updated,
				tl."isconfirmed" AS isConfirmed,
				tl.event_id
		FROM public.checker_teamleader tl) ce ON c.event_id = ce.event_id
WHERE c.rn = 1
WITH NO DATA;

ALTER TABLE public.checker_to_team
	OWNER TO postgres;

GRANT ALL ON TABLE public.checker_to_team TO postgres;
GRANT SELECT ON TABLE public.checker_to_team TO superset_ro;

CREATE INDEX a11_checker_to_team_checker_email_idx
	ON public.checker_to_team USING btree
	(checker_email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_team_checker_id_idx
	ON public.checker_to_team USING btree
	(checker_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_team_checker_role_idx
	ON public.checker_to_team USING btree
	(checker_role COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_team_event_id_idx
	ON public.checker_to_team USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_team_event_idx
	ON public.checker_to_team USING btree
	(event COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_team_event_timestamp_idx
	ON public.checker_to_team USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_team_team_id_idx
	ON public.checker_to_team USING btree
	(team_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_checker_to_team_team_type_idx
	ON public.checker_to_team USING btree
	(team_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_invoices()

-- DROP PROCEDURE IF EXISTS public.create_invoices();

CREATE OR REPLACE PROCEDURE public.create_invoices(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.invoices
TABLESPACE pg_default
AS
SELECT * FROM public._invoices
WITH NO DATA;

ALTER TABLE public.invoices
	OWNER TO postgres;

GRANT ALL ON TABLE public.invoices TO postgres;
GRANT SELECT ON TABLE public.invoices TO superset_ro;

CREATE INDEX a11_invoices_event_id_idx
	ON public.invoices USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_invoice_id_idx
	ON public.invoices USING btree
	(invoice_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_issue_type_idx
	ON public.invoices USING btree
	(issue_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_journal_code_idx
	ON public.invoices USING btree
	(journal_code COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_journal_name_idx
	ON public.invoices USING btree
	(journal_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_manuscript_custom_id_idx
	ON public.invoices USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_manuscript_custom_id_invoice_created_date_idx
	ON public.invoices USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", invoice_created_date)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_m_customid_invoice_created_is_credi_idx
	ON public.invoices USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", invoice_created_date, is_credit_note)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_publisher_name_idx
	ON public.invoices USING btree
	(publisher_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_invoices_data()

-- DROP PROCEDURE IF EXISTS public.create_invoices_data();

CREATE OR REPLACE PROCEDURE public.create_invoices_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.invoices_data
TABLESPACE pg_default
AS
SELECT i.event_id,
	i.event_type AS event,
	i.event_time AS event_timestamp,
	i.manuscript_custom_id,
	i.invoiceid AS invoice_id,
	i.invoicestatus AS status,
	cast_to_timestamp(i.invoicecreateddate) AS invoice_created_date,
	cast_to_timestamp(i.invoiceissueddate) AS invoice_issue_date,
	cast_to_timestamp(i.manuscriptaccepteddate) AS manuscript_accepted_date,
	cast_to_timestamp(i.updated) AS updated_date,
	i.referencenumber AS reference_number,
	COALESCE(i.iscreditnote::boolean, false) AS is_credit_note,
	i.creditnoteforinvoice AS cancelled_invoice_reference,
	i.costs_grossapc::double precision AS gross_apc_value,
	i.vat_percentage,
	i.costs_netapc::double precision AS net_apc,
	i.costs_netamount::double precision AS net_amount,
	i.costs_vatamount::double precision AS vat_amount,
	i.costs_totaldiscount::double precision AS discount,
	i.costs_dueamount::double precision AS due_amount,
	i.costs_paidamount::double precision AS paid_amount,
	cast_to_timestamp(i.lastpaymentdate) AS payment_date,
	COALESCE(i.currency, 'USD'::text) AS payment_currency,
	i.payment_type,
	concat(i.payer_firstname, ' ', i.payer_lastname) AS payer_given_name,
	i.payer_email,
	i.payer_countrycode AS payer_country,
	i.payer_billingaddress AS payer_address,
	i.payer_organization AS organization
FROM public.invoice i
WITH NO DATA;

ALTER TABLE public.invoices_data
	OWNER TO postgres;

GRANT ALL ON TABLE public.invoices_data TO postgres;
GRANT SELECT ON TABLE public.invoices_data TO superset_ro;

CREATE INDEX a11_invoices_data_cancelled_invoice_reference_idx
	ON public.invoices_data USING btree
	(cancelled_invoice_reference COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_event_id_idx
	ON public.invoices_data USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_event_idx
	ON public.invoices_data USING btree
	(event COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_event_timestamp_idx
	ON public.invoices_data USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_invoice_created_date_idx
	ON public.invoices_data USING btree
	(invoice_created_date)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_invoice_id_event_timestamp_updated_date_idx
	ON public.invoices_data USING btree
	(invoice_id COLLATE pg_catalog."default", event_timestamp, updated_date)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_invoice_id_idx
	ON public.invoices_data USING btree
	(invoice_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_invoice_issue_date_idx
	ON public.invoices_data USING btree
	(invoice_issue_date)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_custom_id_event_event_timestamp_idx
	ON public.invoices_data USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", event COLLATE pg_catalog."default", event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_manuscript_custom_id_idx
	ON public.invoices_data USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_reference_number_idx
	ON public.invoices_data USING btree
	(reference_number COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_invoices_data_status_idx
	ON public.invoices_data USING btree
	(status COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_journal_editorial_board()

-- DROP PROCEDURE IF EXISTS public.create_journal_editorial_board();

CREATE OR REPLACE PROCEDURE public.create_journal_editorial_board(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.journal_editorial_board
TABLESPACE pg_default
AS
SELECT j.journal_id,
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
	cast_to_timestamp(j.inviteddate)::timestamp without time zone AS invited_date,
	cast_to_timestamp(j.assigneddate)::timestamp without time zone AS assigned_date,
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
		FROM public.journals j_1
			JOIN public.journal_editor je ON je.event_id = j_1.event_id
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
		FROM public.journals j_2
			JOIN public.journal_section js ON j_2.event_id = js.event_id
			JOIN public.journal_section_editor jse ON js.event_id = jse.event_id AND js.id = jse.journal_section_id
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
		FROM public.journals j_3
			JOIN public.journal_specialissue jsi ON j_3.event_id = jsi.event_id
			JOIN public.journal_specialissue_editor jsie ON jsi.event_id = jsie.event_id AND jsi.id = jsie.journal_specialissue_id
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
		FROM public.journals j_4
			JOIN public.journal_section js ON j_4.event_id = js.event_id AND js.journal_id = j_4.journal_id::uuid
			JOIN public.journal_section_specialissue jssi ON js.event_id = jssi.event_id AND jssi.journal_section_id = js.id
			JOIN public.journal_section_specialissue_editor jssie ON jssi.event_id = jssie.event_id AND jssi.id = jssie.journal_section_specialissue_id) j
WITH NO DATA;

ALTER TABLE public.journal_editorial_board
	OWNER TO postgres;

GRANT ALL ON TABLE public.journal_editorial_board TO postgres;
GRANT SELECT ON TABLE public.journal_editorial_board TO superset_ro;

CREATE INDEX a11_journal_editorial_board_email_idx
	ON public.journal_editorial_board USING btree
	(email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_editorial_board_invited_date_idx
	ON public.journal_editorial_board USING btree
	(invited_date DESC)
	TABLESPACE pg_default;
CREATE INDEX a11_journal_editorial_board_invited_date_special_issue_id
	ON public.journal_editorial_board USING btree
	(invited_date DESC, special_issue_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_editorial_board_journal_id_idx
	ON public.journal_editorial_board USING btree
	(journal_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_editorial_board_role_type_idx
	ON public.journal_editorial_board USING btree
	(role_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_editorial_board_section_id_idx
	ON public.journal_editorial_board USING btree
	(section_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_editorial_board_special_issue_id_idx
	ON public.journal_editorial_board USING btree
	(special_issue_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;	

end;
$BODY$;


-- PROCEDURE: public.create_journal_sections()

-- DROP PROCEDURE IF EXISTS public.create_journal_sections();

CREATE OR REPLACE PROCEDURE public.create_journal_sections(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.journal_sections
TABLESPACE pg_default
AS
SELECT j.journal_id,
	j.journal_name,
	j.journal_issn,
	j.journal_code,
	j.event_date,
	js.id::text AS section_id,
	js.name AS section_name,
	cast_to_timestamp(js.created) AS created_date,
	cast_to_timestamp(js.updated) AS updated_date,
	--to be confirmed if still needed
	js.specialissues_json as special_issues_json,
	js.editors_json	
FROM public.journals j
	JOIN public.journal_section js ON j.event_id = js.event_id
WITH NO DATA;

ALTER TABLE public.journal_sections
	OWNER TO postgres;

GRANT ALL ON TABLE public.journal_sections TO postgres;
GRANT SELECT ON TABLE public.journal_sections TO superset_ro;

CREATE INDEX a11_journal_sections_event_date_idx
	ON public.journal_sections USING btree
	(event_date)
	TABLESPACE pg_default;
CREATE INDEX a11_journal_sections_journal_code_idx
	ON public.journal_sections USING btree
	(journal_code COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_sections_journal_issn_idx
	ON public.journal_sections USING btree
	(journal_issn COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_sections_journal_name_idx
	ON public.journal_sections USING btree
	(journal_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_sections_journal_id_idx
	ON public.journal_sections USING btree
	(journal_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;	
	end;
$BODY$;


-- PROCEDURE: public.create_journal_special_issues()

-- DROP PROCEDURE IF EXISTS public.create_journal_special_issues();

CREATE OR REPLACE PROCEDURE public.create_journal_special_issues(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.journal_special_issues
TABLESPACE pg_default
AS
SELECT si_data.journal_id,
	si_data.journal_name,
	si_data.journal_issn,
	si_data.journal_code,
	si_data.event_date,
	si_data.special_issue_id::text AS special_issue_id,
	si_data.special_issue_name,
	si_data.special_issue_custom_id,
	si_data.closed_date,
	si_data.open_date,
	si_data.status,
	si_data.section_id,
	si_data.section_name,
	concat(lead_guest_editor.given_names, ' ', lead_guest_editor.surname) AS lead_guest_editor_name,
	lead_guest_editor.email AS lead_guest_editor_email,
	lead_guest_editor.aff AS lead_guest_editor_affiliation,
	lead_guest_editor.country AS lead_guest_editor_country,
	editors_counts.editor_count
FROM public.journal_special_issues_data si_data
	LEFT JOIN LATERAL ( SELECT jeb.special_issue_id,
			count(*) AS editor_count
		FROM public.journal_editorial_board jeb
		WHERE jeb.special_issue_id = si_data.special_issue_id::text AND jeb.role_type = 'academicEditor'::text
		GROUP BY jeb.special_issue_id) editors_counts ON editors_counts.special_issue_id = si_data.special_issue_id::text
	LEFT JOIN LATERAL ( SELECT jeb.journal_id,
			jeb.journal_name,
			jeb.section_id,
			jeb.section_name,
			jeb.special_issue_id,
			jeb.special_issue_name,
			jeb.email,
			jeb.given_names,
			jeb.surname,
			jeb.aff,
			jeb.status,
			jeb.role_type,
			jeb.role_label,
			jeb.invited_date,
			jeb.assigned_date,
			jeb.country,
			jeb.is_corresponding,
			jeb.user_id
		FROM public.journal_editorial_board jeb
		WHERE jeb.special_issue_id = si_data.special_issue_id::text AND jeb.role_type = 'triageEditor'::text
		ORDER BY jeb.invited_date DESC NULLS LAST
		LIMIT 1) lead_guest_editor ON lead_guest_editor.special_issue_id = si_data.special_issue_id::text
WITH NO DATA;

ALTER TABLE public.journal_special_issues
	OWNER TO postgres;

GRANT ALL ON TABLE public.journal_special_issues TO postgres;
GRANT SELECT ON TABLE public.journal_special_issues TO superset_ro;

end;
$BODY$;


-- PROCEDURE: public.create_journal_special_issues_data()

-- DROP PROCEDURE IF EXISTS public.create_journal_special_issues_data();

CREATE OR REPLACE PROCEDURE public.create_journal_special_issues_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.journal_special_issues_data
TABLESPACE pg_default
AS
SELECT j.journal_id,
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
	--to be confirmed if still needed
	jsi.editors_json
FROM public.journals j
	JOIN public.journal_specialissue jsi ON j.event_id = jsi.event_id AND j.journal_id::uuid = jsi.journal_id
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
	--to be confirmed if still needed
	jssi.editors_json
FROM public.journals j
	JOIN public.journal_section js ON j.event_id = js.event_id
	JOIN public.journal_section_specialissue jssi ON js.event_id = jssi.event_id AND js.id = jssi.journal_section_id
WITH NO DATA;

ALTER TABLE public.journal_special_issues_data
	OWNER TO postgres;

GRANT ALL ON TABLE public.journal_special_issues_data TO postgres;
GRANT SELECT ON TABLE public.journal_special_issues_data TO superset_ro;

CREATE INDEX a11_journal_special_issues_data_event_date_idx
	ON public.journal_special_issues_data USING btree
	(event_date)
	TABLESPACE pg_default;
CREATE INDEX a11_journal_special_issues_data_journal_code_idx
	ON public.journal_special_issues_data USING btree
	(journal_code COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_special_issues_data_journal_id_idx
	ON public.journal_special_issues_data USING btree
	(journal_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_special_issues_data_journal_issn_idx
	ON public.journal_special_issues_data USING btree
	(journal_issn COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_special_issues_data_journal_name_idx
	ON public.journal_special_issues_data USING btree
	(journal_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_special_issues_data_special_issue_id_idx
	ON public.journal_special_issues_data USING btree
	(special_issue_id)
	TABLESPACE pg_default;
CREATE INDEX a11_journal_special_issues_data_special_issue_name_idx
	ON public.journal_special_issues_data USING btree
	(special_issue_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journal_specialissuesdata_special_issuecustomid_idx
	ON public.journal_special_issues_data USING btree
	(special_issue_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_journals()

-- DROP PROCEDURE IF EXISTS public.create_journals();

CREATE OR REPLACE PROCEDURE public.create_journals(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.journals
TABLESPACE pg_default
AS
SELECT j1.event,
	j1.journal_id,
	j1.journal_issn,
	j1.journal_name,
	j1.peer_review_model,
	COALESCE(publisher.publisher_name, j1.publisher_name, 'Hindawi'::text) AS publisher_name,
	j1.is_active,
	j1.journal_code,
	j1.journal_email,
	j1.apc,
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
		FROM public.journals_data jd) j1
	LEFT JOIN journal_to_publisher publisher ON j1.journal_id = publisher.journal_id
	LEFT JOIN ( SELECT acceptance_rates.journal_id,
			acceptance_rates.month,
			avg(acceptance_rates.journal_rate) AS journal_rate
		FROM acceptance_rates
		GROUP BY acceptance_rates.journal_id, acceptance_rates.month) individual_ar ON individual_ar.month = to_char(now(), 'YYYY-MM-01'::text)::date AND j1.journal_id = individual_ar.journal_id
	LEFT JOIN ( SELECT acceptance_rates.month,
			avg(acceptance_rates.journal_rate) AS journal_rate
		FROM acceptance_rates
		WHERE acceptance_rates.journal_rate IS NOT NULL
		GROUP BY acceptance_rates.month) global_ar ON global_ar.month = to_char(now(), 'YYYY-MM-01'::text)::date
WHERE j1.rn = 1
WITH NO DATA;

ALTER TABLE public.journals
	OWNER TO postgres;

GRANT ALL ON TABLE public.journals TO postgres;
GRANT SELECT ON TABLE public.journals TO superset_ro;

CREATE INDEX a11_journals_journal_code_idx
	ON public.journals USING btree
	(journal_code COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journals_journal_id_event_date_idx
	ON public.journals USING btree
	(journal_id COLLATE pg_catalog."default", event_date)
	TABLESPACE pg_default;
CREATE INDEX a11_journals_journal_id_idx
	ON public.journals USING btree
	(journal_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journals_journal_issn_idx
	ON public.journals USING btree
	(journal_issn COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journals_journal_name_idx
	ON public.journals USING btree
	(journal_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_journals_publisher_name_idx
	ON public.journals USING btree
	(publisher_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_journals_data()

-- DROP PROCEDURE IF EXISTS public.create_journals_data();

CREATE OR REPLACE PROCEDURE public.create_journals_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.journals_data
TABLESPACE pg_default
AS

SELECT j.event_id,
	j.event_type AS event,
	j.id::text AS journal_id,
	j.issn AS journal_issn,
	j.name AS journal_name,
	j.isactive::boolean AS is_active,
	j.code AS journal_code,
	j.apc,
	j.email AS journal_email,
	j.publishername AS publisher_name,
	j.peerreviewmodelname AS peer_review_model,
	COALESCE(j.event_time, j.updated::timestamp with time zone, cast_to_timestamp('1980-01-01'::text)::timestamp with time zone) AS event_date,
	cast_to_timestamp(j.updated) AS updated_date
FROM public.journal j
WITH NO DATA;

ALTER TABLE public.journals_data
	OWNER TO postgres;

GRANT ALL ON TABLE public.journals_data TO postgres;
GRANT SELECT ON TABLE public.journals_data TO superset_ro;

CREATE INDEX public_journals_data_event_date_idx
	ON public.journals_data USING btree
	(event_date)
	TABLESPACE pg_default;
CREATE INDEX public_journals_data_journal_id_event_date_idx
	ON public.journals_data USING btree
	(journal_id COLLATE pg_catalog."default", event_date)
	TABLESPACE pg_default;
CREATE INDEX public_journals_data_journal_id_idx
	ON public.journals_data USING btree
	(journal_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX public_journals_data_journal_id_journal_issn_idx
	ON public.journals_data USING btree
	(journal_id COLLATE pg_catalog."default", journal_issn COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX public_journals_data_publisher_name_idx
	ON public.journals_data USING btree
	(publisher_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;	
	end;
$BODY$;


-- PROCEDURE: public.create_manuscript_editors()

-- DROP PROCEDURE IF EXISTS public.create_manuscript_editors();

CREATE OR REPLACE PROCEDURE public.create_manuscript_editors(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.manuscript_editors
TABLESPACE pg_default
AS
SELECT 
	e.id::text AS id,
	s.manuscript_custom_id,
	s.journal_name,
	s.section_name,
	s.special_issue_name,
	s.special_issue_id,
	e.email,
	cast_to_timestamp(e.expireddate) AS expired_date,
	cast_to_timestamp(e.inviteddate) AS invited_date,
	cast_to_timestamp(e.removeddate) AS removed_date,
	cast_to_timestamp(e.accepteddate) AS accepted_date,
	cast_to_timestamp(e.assigneddate) AS assigned_date,
	cast_to_timestamp(e.declineddate) AS declined_date,
	e.country,
	e.status,
	e.iscorresponding::boolean AS is_corresponding,
	e.userid AS user_id,
	e.givennames AS given_names,
	e.surname,
	e.aff,
	e.role_type,
	e.role_label,
	s.event_id
FROM 
	public.submissions s 
	--public.manuscript m 
	--JOIN ON m.event_id = s.event_id AND m.id = s.manuscript_version_id::uuid
	--JOIN public.manuscript_editor e ON m.event_id = e.event_id AND m.id = e.manuscript_id
	JOIN public.manuscript_editor e ON s.event_id = e.event_id AND s.manuscript_version_id::uuid = e.manuscript_id
WITH NO DATA;

ALTER TABLE public.manuscript_editors
	OWNER TO postgres;

GRANT ALL ON TABLE public.manuscript_editors TO postgres;
GRANT SELECT ON TABLE public.manuscript_editors TO superset_ro;

CREATE INDEX a11_manuscript_editors_accepted_date_idx
	ON public.manuscript_editors USING btree
	(accepted_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_assigned_date_idx
	ON public.manuscript_editors USING btree
	(assigned_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_assigned_date_idx1
	ON public.manuscript_editors USING btree
	(assigned_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_declined_date_idx
	ON public.manuscript_editors USING btree
	(declined_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_email_idx
	ON public.manuscript_editors USING btree
	(email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_event_id_idx
	ON public.manuscript_editors USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_id_idx
	ON public.manuscript_editors USING btree
	(id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_invited_date_idx
	ON public.manuscript_editors USING btree
	(invited_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_manuscript_custom_id_idx
	ON public.manuscript_editors USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_custom_id_invited_accept_idx
	ON public.manuscript_editors USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", invited_date DESC, accepted_date DESC)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_manuscript_custom_id_invited_date_idx
	ON public.manuscript_editors USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", invited_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_manuscript_custom_id_role_type_idx
	ON public.manuscript_editors USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", role_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_custom_id_role_type_status_idx
	ON public.manuscript_editors USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", role_type COLLATE pg_catalog."default", status COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_removed_date_idx
	ON public.manuscript_editors USING btree
	(removed_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_role_type_idx
	ON public.manuscript_editors USING btree
	(role_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_status_idx
	ON public.manuscript_editors USING btree
	(status COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_editors_user_id_idx
	ON public.manuscript_editors USING btree
	(user_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_manuscript_reviewers()

-- DROP PROCEDURE IF EXISTS public.create_manuscript_reviewers();

CREATE OR REPLACE PROCEDURE public.create_manuscript_reviewers(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.manuscript_reviewers
TABLESPACE pg_default
AS
	SELECT 
		s.manuscript_custom_id,
		s.journal_name,
		s.section_name,
		s.special_issue_name,
		s.special_issue_id,
		r.manuscript_version as version,
		r.email,
		r.id::text AS reviewer_id,
		r.responded AS responded_date,
		r.fromservice AS from_service,
		r.expireddate AS expired_date,
		r.inviteddate AS invited_date,
		r.accepteddate AS accepted_date,
		r.declineddate AS declined_date,
		r.status,
		r.aff,
		r.country,
		r.userid AS user_id,
		r.givennames AS given_names,
		r.surname,
		r.created AS created_date,
		r.updated AS updated_date,
		s.event_id
	FROM public.submissions s
		JOIN public.manuscript_reviewer r 
			ON s.event_id = r.event_id 
WITH NO DATA;

ALTER TABLE public.manuscript_reviewers
	OWNER TO postgres;

GRANT ALL ON TABLE public.manuscript_reviewers TO postgres;
GRANT SELECT ON TABLE public.manuscript_reviewers TO superset_ro;

CREATE INDEX a11_manuscript_reviewers_accepted_date_idx
	ON public.manuscript_reviewers USING btree
	(accepted_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_created_date_idx
	ON public.manuscript_reviewers USING btree
	(created_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_declined_date_idx
	ON public.manuscript_reviewers USING btree
	(declined_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_email_idx
	ON public.manuscript_reviewers USING btree
	(email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_event_id_idx
	ON public.manuscript_reviewers USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_expired_date_idx
	ON public.manuscript_reviewers USING btree
	(expired_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_invited_date_idx
	ON public.manuscript_reviewers USING btree
	(invited_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_manuscript_custom_id_idx
	ON public.manuscript_reviewers USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_manuscript_custom_id_version_idx
	ON public.manuscript_reviewers USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", version COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_responded_date_idx
	ON public.manuscript_reviewers USING btree
	(responded_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_reviewer_id_idx
	ON public.manuscript_reviewers USING btree
	(reviewer_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_status_idx
	ON public.manuscript_reviewers USING btree
	(status COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_user_id_idx
	ON public.manuscript_reviewers USING btree
	(user_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviewers_version_idx
	ON public.manuscript_reviewers USING btree
	(version COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_manuscript_reviews()

-- DROP PROCEDURE IF EXISTS public.create_manuscript_reviews();

CREATE OR REPLACE PROCEDURE public.create_manuscript_reviews(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.manuscript_reviews
TABLESPACE pg_default
AS
SELECT reviews.manuscript_custom_id,
	reviews.version,
	reviews.review_id::text,
	reviews.created_date::timestamp without time zone,
	reviews.updated_date::timestamp without time zone,
	reviews.submitted_date::timestamp without time zone,
	reviews.recommendation,
	reviews.team_member_id,
	reviews.journal_name,
	reviews.section_name,
	reviews.special_issue_name,
	reviews.special_issue_id,
	reviews.event_id,
		CASE
			WHEN editors.id IS NOT NULL THEN editors.email
			WHEN reviewers.reviewer_id IS NOT NULL THEN reviewers.email
			WHEN authors.id IS NOT NULL THEN authors.email
			ELSE NULL::text
		END AS team_member_email,
		CASE
			WHEN editors.id IS NOT NULL THEN 'editor'::text
			WHEN reviewers.reviewer_id IS NOT NULL THEN 'reviewer'::text
			WHEN authors.id IS NOT NULL THEN 'author'::text
			ELSE NULL::text
		END AS team_type
FROM ( SELECT s.manuscript_custom_id,
			r.manuscript_version as version,
			r.id AS review_id,
			r.created AS created_date,
			r.updated AS updated_date,
			r.submitted AS submitted_date,
			r.recommendation,
			r.teamMemberId AS team_member_id,
			s.journal_name,
			s.section_name,
			s.special_issue_name,
			s.special_issue_id,
			s.event_id
		FROM public.submissions s 
			INNER JOIN public.manuscript_review r on s.event_id = r.event_id) reviews
	LEFT JOIN LATERAL ( SELECT e.id,
			e.manuscript_custom_id,
			e.journal_name,
			e.section_name,
			e.special_issue_name,
			e.special_issue_id,
			e.email,
			e.expired_date,
			e.invited_date,
			e.removed_date,
			e.accepted_date,
			e.assigned_date,
			e.declined_date,
			e.country,
			e.status,
			e.is_corresponding,
			e.user_id,
			e.given_names,
			e.surname,
			e.aff,
			e.role_type,
			e.role_label,
			e.event_id
		FROM public.manuscript_editors e
		WHERE e.id = reviews.team_member_id
		LIMIT 1) editors ON editors.id = reviews.team_member_id
	LEFT JOIN LATERAL ( SELECT r.manuscript_custom_id,
			r.journal_name,
			r.section_name,
			r.special_issue_name,
			r.special_issue_id,
			r.version,
			r.email,
			r.reviewer_id,
			r.responded_date,
			r.from_service,
			r.expired_date,
			r.invited_date,
			r.accepted_date,
			r.declined_date,
			r.status,
			r.aff,
			r.country,
			r.user_id,
			r.given_names,
			r.surname,
			r.created_date,
			r.updated_date,
			r.event_id
		FROM public.manuscript_reviewers r
		WHERE r.reviewer_id = reviews.team_member_id
		LIMIT 1) reviewers ON reviewers.reviewer_id = reviews.team_member_id
	LEFT JOIN LATERAL ( SELECT a.id,
			a.manuscript_custom_id,
			a.email,
			a.country,
			a.is_corresponding,
			a.is_submitting,
			a.user_id,
			a.given_names,
			a.surname,
			a.aff,
			a.event_id
		FROM public.authors a
		WHERE a.id = reviews.team_member_id
		LIMIT 1) authors ON authors.id = reviews.team_member_id
WITH NO DATA;

ALTER TABLE public.manuscript_reviews
	OWNER TO postgres;

GRANT ALL ON TABLE public.manuscript_reviews TO postgres;
GRANT SELECT ON TABLE public.manuscript_reviews TO superset_ro;

CREATE INDEX a11_manuscript_reviews_created_date_idx
	ON public.manuscript_reviews USING btree
	(created_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_manuscript_custom_id_idx
	ON public.manuscript_reviews USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_custom_id_team_type_submitted_idx
	ON public.manuscript_reviews USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", team_type COLLATE pg_catalog."default", submitted_date DESC)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_manuscript_custom_id_version_idx
	ON public.manuscript_reviews USING btree
	(manuscript_custom_id COLLATE pg_catalog."default", version COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_recommendation_idx
	ON public.manuscript_reviews USING btree
	(recommendation COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_submitted_date_idx
	ON public.manuscript_reviews USING btree
	(submitted_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_team_member_email_idx
	ON public.manuscript_reviews USING btree
	(team_member_email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_team_member_email_team_type_idx
	ON public.manuscript_reviews USING btree
	(team_member_email COLLATE pg_catalog."default", team_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_team_member_id_idx
	ON public.manuscript_reviews USING btree
	(team_member_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_team_type_idx
	ON public.manuscript_reviews USING btree
	(team_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_updated_date_idx
	ON public.manuscript_reviews USING btree
	(updated_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_reviews_version_idx
	ON public.manuscript_reviews USING btree
	(version COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_manuscript_users()

-- DROP PROCEDURE IF EXISTS public.create_manuscript_users();

CREATE OR REPLACE PROCEDURE public.create_manuscript_users(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.manuscript_users
TABLESPACE pg_default
AS
SELECT users.manuscript_custom_id,
	users.email,
	users.given_names,
	users.surname,
	users.status,
	users.role,
	user_identities.orcid,
	m.submission_id,
	m.manuscript_version_id,
	m.journal_name,
	m.special_issue_custom_id,
	m.submission_date
FROM ( SELECT a.manuscript_custom_id,
			a.email,
			a.given_names,
			a.surname,
			'active'::text AS status,
			'author'::text AS role
		FROM public.authors a
		UNION
		SELECT me.manuscript_custom_id,
			me.email,
			me.given_names,
			me.surname,
			me.status,
			me.role_type
		FROM public.manuscript_editors me
		UNION
		SELECT mr.manuscript_custom_id,
			mr.email,
			mr.given_names,
			mr.surname,
			mr.status,
			'reviewer'::text AS role
		FROM public.manuscript_reviewers mr) users
	JOIN public.manuscripts m ON m.manuscript_custom_id = users.manuscript_custom_id
	LEFT JOIN LATERAL ( SELECT users_data.event_id,
			users_data.event_timestamp,
			users_data.email,
			users_data.unique_id,
			users_data.orcid
		FROM public.users_data
		WHERE public.users_data.email = users.email AND users_data.orcid IS NOT NULL
		LIMIT 1) user_identities ON user_identities.email = users.email
WITH NO DATA;

ALTER TABLE public.manuscript_users
	OWNER TO postgres;

GRANT ALL ON TABLE public.manuscript_users TO postgres;
GRANT SELECT ON TABLE public.manuscript_users TO superset_ro;

CREATE INDEX a11_manuscript_users_email_idx
	ON public.manuscript_users USING btree
	(email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_journal_name_idx
	ON public.manuscript_users USING btree
	(journal_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_manuscript_custom_id_idx
	ON public.manuscript_users USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_manuscript_version_id_idx
	ON public.manuscript_users USING btree
	(manuscript_version_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_role_idx
	ON public.manuscript_users USING btree
	(role COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_special_issue_custom_id_idx
	ON public.manuscript_users USING btree
	(special_issue_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_status_idx
	ON public.manuscript_users USING btree
	(status COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_submission_date_idx
	ON public.manuscript_users USING btree
	(submission_date DESC)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_submission_id_idx
	ON public.manuscript_users USING btree
	(submission_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscript_users_submission_id_idx1
	ON public.manuscript_users USING btree
	(submission_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_manuscripts()

-- DROP PROCEDURE IF EXISTS public.create_manuscripts();

CREATE OR REPLACE PROCEDURE public.create_manuscripts(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.manuscripts
TABLESPACE pg_default
AS
SELECT * FROM public._manuscripts -- select * from the table
WITH NO DATA;

ALTER TABLE public.manuscripts
	OWNER TO postgres;

GRANT ALL ON TABLE public.manuscripts TO postgres;
GRANT SELECT ON TABLE public.manuscripts TO superset_ro;

CREATE INDEX a11_manuscripts_article_type_idx
	ON public.manuscripts USING btree
	(article_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_editorial_assistant_email_idx
	ON public.manuscripts USING btree
	(editorial_assistant_email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_final_decision_date_idx
	ON public.manuscripts USING btree
	(final_decision_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_final_decision_type_idx
	ON public.manuscripts USING btree
	(final_decision_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_handling_editor_email_idx
	ON public.manuscripts USING btree
	(handling_editor_email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_journal_id_idx
	ON public.manuscripts USING btree
	(journal_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_journal_name_idx
	ON public.manuscripts USING btree
	(journal_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE UNIQUE INDEX manuscripts_manuscript_custom_id_idx
	ON public.manuscripts USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_preprint_value_idx
	ON public.manuscripts USING btree
	(preprint_value COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_publisher_name_idx
	ON public.manuscripts USING btree
	(publisher_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_resubmission_date_idx
	ON public.manuscripts USING btree
	(resubmission_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_source_journal_idx
	ON public.manuscripts USING btree
	(source_journal COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_submission_date_idx
	ON public.manuscripts USING btree
	(submission_date)
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_submission_id_idx
	ON public.manuscripts USING btree
	(submission_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_triage_editor_email_idx
	ON public.manuscripts USING btree
	(triage_editor_email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_manuscripts_version_idx
	ON public.manuscripts USING btree
	(version COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_payments()

-- DROP PROCEDURE IF EXISTS public.create_payments();

CREATE OR REPLACE PROCEDURE public.create_payments(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.payments
TABLESPACE pg_default
AS
SELECT last_inv.event_id,
	last_inv.invoice_id,
	last_inv.manuscript_custom_id,
	last_inv.reference_number,
	last_inv.invoice_issue_date,
	last_inv."paymenttype" AS payment_type,
	last_inv."foreignpaymentid" AS payment_reference,
	cast_to_timestamp(last_inv."paymentdate") AS payment_date,
	last_inv."paymentamount"::double precision AS payment_amount
FROM ( SELECT ie."paymenttype",
			ie."foreignpaymentid",
			ie."paymentdate",
			ie."paymentamount",
			last_inv_1.event_id,
			last_inv_1.event,
			last_inv_1.event_timestamp,
			last_inv_1.manuscript_custom_id,
			last_inv_1.invoice_id,
			last_inv_1.status,
			last_inv_1.invoice_created_date,
			last_inv_1.invoice_issue_date,
			last_inv_1.manuscript_accepted_date,
			last_inv_1.updated_date,
			last_inv_1.reference_number,
			last_inv_1.is_credit_note,
			last_inv_1.cancelled_invoice_reference,
			last_inv_1.gross_apc_value,
			last_inv_1.vat_percentage,
			last_inv_1.net_apc,
			last_inv_1.net_amount,
			last_inv_1.vat_amount,
			last_inv_1.discount,
			last_inv_1.due_amount,
			last_inv_1.paid_amount,
			last_inv_1.payment_date,
			last_inv_1.payment_currency,
			last_inv_1.payment_type,
			last_inv_1.payer_given_name,
			last_inv_1.payer_email,
			last_inv_1.payer_country,
			last_inv_1.payer_address,
			last_inv_1.organization,
			last_inv_1.rn
		FROM ( SELECT i.event_id,
					i.event,
					i.event_timestamp,
					i.manuscript_custom_id,
					i.invoice_id,
					i.status,
					i.invoice_created_date,
					i.invoice_issue_date,
					i.manuscript_accepted_date,
					i.updated_date,
					i.reference_number,
					i.is_credit_note,
					i.cancelled_invoice_reference,
					i.gross_apc_value,
					i.vat_percentage,
					i.net_apc,
					i.net_amount,
					i.vat_amount,
					i.discount,
					i.due_amount,
					i.paid_amount,
					i.payment_date,
					i.payment_currency,
					i.payment_type,
					i.payer_given_name,
					i.payer_email,
					i.payer_country,
					i.payer_address,
					i.organization,
					i.rn
				FROM ( SELECT id.event_id,
							id.event,
							id.event_timestamp,
							id.manuscript_custom_id,
							id.invoice_id,
							id.status,
							id.invoice_created_date,
							id.invoice_issue_date,
							id.manuscript_accepted_date,
							id.updated_date,
							id.reference_number,
							id.is_credit_note,
							id.cancelled_invoice_reference,
							id.gross_apc_value,
							id.vat_percentage,
							id.net_apc,
							id.net_amount,
							id.vat_amount,
							id.discount,
							id.due_amount,
							id.paid_amount,
							id.payment_date,
							id.payment_currency,
							id.payment_type,
							id.payer_given_name,
							id.payer_email,
							id.payer_country,
							id.payer_address,
							id.organization,
							row_number() OVER (PARTITION BY id.invoice_id ORDER BY (
								CASE
									WHEN id.status = 'FINAL'::text THEN 1
									WHEN id.status = 'ACTIVE'::text THEN 2
									ELSE 3
								END), id.event_timestamp DESC NULLS LAST) AS rn
						FROM public.invoices_data id) i
				WHERE i.rn = 1) last_inv_1
			JOIN public.invoice_payment ie ON ie.event_id = last_inv_1.event_id) last_inv
WITH NO DATA;

ALTER TABLE public.payments
	OWNER TO postgres;

GRANT ALL ON TABLE public.payments TO postgres;
GRANT SELECT ON TABLE public.payments TO superset_ro;

CREATE INDEX a11_payments_event_id_idx
	ON public.payments USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_payments_invoice_id_idx
	ON public.payments USING btree
	(invoice_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_payments_invoice_id_payment_date_idx
	ON public.payments USING btree
	(invoice_id COLLATE pg_catalog."default", payment_date DESC)
	TABLESPACE pg_default;
CREATE INDEX a11_payments_manuscript_custom_id_idx
	ON public.payments USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_payments_payment_date_idx
	ON public.payments USING btree
	(payment_date DESC)
	TABLESPACE pg_default;
CREATE INDEX a11_payments_payment_type_idx
	ON public.payments USING btree
	(payment_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_payments_reference_number_idx
	ON public.payments USING btree
	(reference_number COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_peer_review_data()

-- DROP PROCEDURE IF EXISTS public.create_peer_review_data();

CREATE OR REPLACE PROCEDURE public.create_peer_review_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.peer_review_data
TABLESPACE pg_default
AS
SELECT pre.id AS event_id,
	pre."time" AS event_timestamp,
	pre.type AS peer_review_event,
	author_view."customId" AS manuscript_custom_id,
	author_view."submissionId" AS submission_id
FROM peer_review_events pre,
	LATERAL jsonb_to_record(pre.payload) author_view("customId" text, "submissionId" text)
WITH NO DATA;

ALTER TABLE public.peer_review_data
	OWNER TO postgres;

GRANT ALL ON TABLE public.peer_review_data TO postgres;
GRANT SELECT ON TABLE public.peer_review_data TO superset_ro;

CREATE INDEX a11_peer_review_data_event_id_idx
	ON public.peer_review_data USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_peer_review_data_event_timestamp_idx
	ON public.peer_review_data USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_peer_review_data_manuscript_custom_id_idx
	ON public.peer_review_data USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_peer_review_data_peer_review_event_idx
	ON public.peer_review_data USING btree
	(peer_review_event COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_peer_review_data_submission_id_idx
	ON public.peer_review_data USING btree
	(submission_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_submissions()

-- DROP PROCEDURE IF EXISTS public.create_submissions();

CREATE OR REPLACE PROCEDURE public.create_submissions(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW public.submissions
TABLESPACE pg_default
AS
SELECT * FROM public._submissions -- select * from he table
WITH NO DATA;

ALTER TABLE public.submissions
	OWNER TO postgres;

GRANT ALL ON TABLE public.submissions TO postgres;
GRANT SELECT ON TABLE public.submissions TO superset_ro;

CREATE INDEX a11_submissions_article_type_idx
	ON public.submissions USING btree
	(article_type COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_submissions_event_timestamp_idx
	ON public.submissions USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_submissions_journal_id_idx
	ON public.submissions USING btree
	(journal_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_submissions_journal_name_idx
	ON public.submissions USING btree
	(journal_name COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_submissions_manuscript_custom_id_idx
	ON public.submissions USING btree
	(manuscript_custom_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_submissions_preprint_value_idx
	ON public.submissions USING btree
	(preprint_value COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_submissions_source_journal_idx
	ON public.submissions USING btree
	(source_journal COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_submissions_submission_date_idx
	ON public.submissions USING btree
	(submission_date)
	TABLESPACE pg_default;
CREATE INDEX a11_submissions_submission_id_idx
	ON public.submissions USING btree
	(submission_id COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- PROCEDURE: public.create_users_data()

-- DROP PROCEDURE IF EXISTS public.create_users_data();

CREATE OR REPLACE PROCEDURE public.create_users_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin

CREATE MATERIALIZED VIEW IF NOT EXISTS public.users_data 
TABLESPACE pg_default
AS

SELECT local_identity.event_id,
	local_identity.event_timestamp,
	local_identity.email,
	local_identity.unique_id::text,
	orcid_identity.identifier AS orcid
FROM ( SELECT ue.user_id AS unique_id,
			ue.event_time AS event_timestamp,
			ue.event_id,
			ue.type,
			ue.identifier,
			ue.email
		FROM public.user_identity ue
		WHERE ue.type = 'local'::text) local_identity 
	LEFT JOIN ( SELECT 
			ue.user_id AS unique_id,
			ue.identifier
		FROM public.user_identity ue
		WHERE ue.type = 'orcid'::text) orcid_identity ON local_identity.unique_id = orcid_identity.unique_id 

WITH NO DATA;

ALTER TABLE public.users_data
	OWNER TO postgres;

GRANT ALL ON TABLE public.users_data TO postgres;
GRANT SELECT ON TABLE public.users_data TO superset_ro;

CREATE INDEX a11_users_data_email_idx
	ON public.users_data USING btree
	(email COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_users_data_email_orcid_idx
	ON public.users_data USING btree
	(email COLLATE pg_catalog."default", orcid COLLATE pg_catalog."default")
	TABLESPACE pg_default;
CREATE INDEX a11_users_data_event_id_idx
	ON public.users_data USING btree
	(event_id)
	TABLESPACE pg_default;
CREATE INDEX a11_users_data_event_timestamp_idx
	ON public.users_data USING btree
	(event_timestamp)
	TABLESPACE pg_default;
CREATE INDEX a11_users_data_orcid_idx
	ON public.users_data USING btree
	(orcid COLLATE pg_catalog."default")
	TABLESPACE pg_default;
	
	end;
$BODY$;


-- ///////////////////////////////////////////////////////////////////////////
-- REFRESH _submissions, _manuscripts AND _invoices as tables
-- ///////////////////////////////////////////////////////////////////////////

-- PROCEDURE: public.sp_refresh_invoices_as_table()

-- DROP PROCEDURE IF EXISTS public.sp_refresh_invoices_as_table();

CREATE OR REPLACE PROCEDURE public.sp_refresh_invoices_as_table(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin
	raise notice '% START', clock_timestamp();

	DROP TABLE IF EXISTS temp_last_invoices;
	CREATE TEMP TABLE temp_last_invoices AS 
	 SELECT *
           FROM ( SELECT *,
                    row_number() OVER (PARTITION BY id.invoice_id ORDER BY (
                        CASE
                            WHEN id.status = 'FINAL'::text THEN 1
                            WHEN id.status = 'ACTIVE'::text THEN 2
                            ELSE 3
                        END), id.event_timestamp DESC NULLS LAST) AS rn
                   FROM public.invoices_data id) i
          WHERE i.rn = 1;
	
	DROP TABLE IF EXISTS temp_article_data;
	CREATE TEMP TABLE temp_article_data AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY t.manuscript_custom_id) as rn
			FROM public.article_data t) tt
	WHERE tt.rn = 1;
	CREATE INDEX idx_temp_article_data_manuscript_custom_id ON temp_article_data(manuscript_custom_id);
	
	
	DROP TABLE IF EXISTS temp_authors_is_submitting;
	CREATE TEMP TABLE temp_authors_is_submitting AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY t.manuscript_custom_id) as rn
			FROM (SELECT * FROM public.authors WHERE is_submitting = true) t) tt
	WHERE tt.rn = 1;
	CREATE INDEX idx_temp_authors_is_submitting_manuscript_custom_id ON temp_authors_is_submitting(manuscript_custom_id);
	
	DROP TABLE IF EXISTS temp_original_invoices;
	CREATE TEMP TABLE temp_original_invoices AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY t.invoice_id) as rn
			FROM (SELECT * FROM public.invoices_data WHERE invoice_id IN 
					 (select distinct cancelled_invoice_reference 
						FROM public.invoices_data where cancelled_invoice_reference is not null)
				 ) t) tt
	WHERE tt.rn = 1;
	CREATE INDEX idx_temp_original_invoices_invoice_id ON temp_original_invoices(invoice_id);

	DROP TABLE IF EXISTS temp_deleted_invoices;
	CREATE TEMP TABLE temp_deleted_invoices AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY t.invoice_id) as rn
			FROM (SELECT * FROM public.invoices_data WHERE event::text = 'InvoiceDraftDeleted'::text) t) tt
	WHERE tt.rn = 1;
	CREATE INDEX idx_deleted_invoices_invoice_id ON temp_deleted_invoices(invoice_id);

	DROP TABLE IF EXISTS temp_first_invoice_event;
	CREATE TEMP TABLE temp_first_invoice_event AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY t.invoice_id ORDER BY (
                CASE
                    WHEN t.event::text = 'InvoiceDraftCreated'::text THEN 1
                    ELSE 2
                END),t.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.invoices_data WHERE event::text = ANY (ARRAY['InvoiceDraftCreated'::character varying::text, 'InvoiceCreated'::character varying::text])) t) tt
	WHERE tt.rn = 1;
	CREATE INDEX idx_temp_first_invoice_event_invoice_id ON temp_first_invoice_event(invoice_id);

	TRUNCATE TABLE public._invoices;
	INSERT INTO public._invoices
	SELECT inv.reference_number AS invoice_reference_number,
    original_invoice.reference_number AS credited_invoice_reference_number,
    inv.is_credit_note,
        CASE
            WHEN deleted_invoices.invoice_id IS NOT NULL THEN true
            ELSE false
        END AS is_deleted,
    deleted_invoices.event_timestamp AS deleted_date,
    inv.manuscript_custom_id,
    inv.invoice_created_date,
    inv.manuscript_accepted_date AS invoice_sent_date,
    inv.invoice_issue_date,
    COALESCE(s.accepted_date, inv.manuscript_accepted_date::timestamp with time zone) AS manuscript_accepted_date,
        CASE
            WHEN inv.status = 'DRAFT'::text THEN NULL::text
            WHEN COALESCE(inv.paid_amount, 0::double precision) = 0::double precision THEN NULL::text
            WHEN inv.status = 'ACTIVE'::text THEN 'Partially Paid'::text
            WHEN inv.status = 'FINAL'::text THEN 'Paid'::text
            ELSE 'unknown'::text
        END AS payment_status,
    inv.invoice_id,
    inv.status AS invoice_status,
    inv.gross_apc_value,
    inv.discount,
    inv.net_apc,
    inv.vat_amount,
    inv.net_amount,
    inv.due_amount,
    inv.paid_amount,
    article_data.published_date,
    inv.payment_date,
    inv.payer_given_name,
    inv.payer_email,
    inv.payment_type,
    inv.payer_country,
    inv.payer_address,
    inv.payment_currency,
    inv.organization,
    payments.payment_reference,
    waivers.waiver_types AS waivers,
    coupons.coupon_codes AS coupons,
    inv.event_id,
    s.title AS manuscript_title,
    s.article_type AS manuscript_article_type,
    s.journal_name,
    s.publisher_name,
    s.journal_code,
        CASE
            WHEN s.special_issue_id IS NOT NULL THEN 'special'::text
            ELSE 'regular'::text
        END AS issue_type,
    s.submission_date AS manuscript_submission_date,
        CASE
            WHEN inv.net_amount = 0::double precision THEN 'free'::text
            ELSE 'paid'::text
        END AS apc,
        CASE
            WHEN first_invoice_event.net_amount = 0::double precision THEN 'waived'::text
            ELSE 'priced'::text
        END AS submission_pricing_status,
    concat(a.given_names, ' ', a.surname) AS corresponding_author_name,
    a.country AS corresponding_author_country,
    a.email AS corresponding_author_email,
    a.aff AS corresponding_author_affiliation
   FROM temp_last_invoices inv
     LEFT JOIN temp_article_data article_data ON article_data.manuscript_custom_id = inv.manuscript_custom_id
     LEFT JOIN public.submissions s ON s.manuscript_custom_id = inv.manuscript_custom_id
     LEFT JOIN temp_authors_is_submitting a ON a.manuscript_custom_id = inv.manuscript_custom_id
     LEFT JOIN ( SELECT ie.id AS event_id,
            string_agg(waivers_1."waiverType", ', '::text) AS waiver_types
           FROM invoice_events ie,
            LATERAL jsonb_to_recordset(((ie.payload -> 'invoiceItems'::text) -> 0) -> 'waivers'::text) waivers_1("waiverType" text)
          GROUP BY ie.id) waivers ON waivers.event_id = inv.event_id
     LEFT JOIN ( SELECT ie.id AS event_id,
            string_agg(coupons_1.code, ', '::text) AS coupon_codes
           FROM invoice_events ie,
            LATERAL jsonb_to_recordset(((ie.payload -> 'invoiceItems'::text) -> 0) -> 'coupons'::text) coupons_1(code text)
          GROUP BY ie.id) coupons ON coupons.event_id = inv.event_id
     LEFT JOIN ( SELECT payments_1.invoice_id,
            string_agg(payments_1.payment_reference, ', '::text) AS payment_reference
           FROM public.payments payments_1
          GROUP BY payments_1.invoice_id) payments ON payments.invoice_id = inv.invoice_id
     LEFT JOIN temp_original_invoices original_invoice ON original_invoice.invoice_id = inv.cancelled_invoice_reference
     LEFT JOIN temp_deleted_invoices deleted_invoices ON deleted_invoices.invoice_id = inv.invoice_id
     LEFT JOIN temp_first_invoice_event first_invoice_event ON first_invoice_event.invoice_id = inv.invoice_id;

	DROP TABLE IF EXISTS temp_article_data;
	DROP TABLE IF EXISTS temp_authors_is_submitting;
	DROP TABLE IF EXISTS temp_original_invoices;
	DROP TABLE IF EXISTS temp_deleted_invoices;
	DROP TABLE IF EXISTS temp_first_invoice_event;

	raise notice '% DONE', clock_timestamp();
end;
$BODY$;


-- PROCEDURE: public.sp_refresh_manuscripts_as_table()

-- DROP PROCEDURE IF EXISTS public.sp_refresh_manuscripts_as_table();

CREATE OR REPLACE PROCEDURE public.sp_refresh_manuscripts_as_table(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin
	raise notice '% START', clock_timestamp();

	DROP TABLE IF EXISTS temp_authors_is_corresponding;
	CREATE TEMP TABLE temp_authors_is_corresponding AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id) as rn
			FROM (SELECT * FROM public.authors WHERE is_corresponding = true) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_authors_is_corresponding_manuscript_custom_id ON temp_authors_is_corresponding(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_authors_is_submitting;
	CREATE TEMP TABLE temp_authors_is_submitting AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id) as rn
			FROM (SELECT * FROM public.authors WHERE is_submitting = true) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_authors_is_submitting_manuscript_custom_id ON temp_authors_is_submitting(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_manuscript_editors_triageEditor;
	CREATE TEMP TABLE temp_manuscript_editors_triageEditor AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id) as rn
			FROM (SELECT * FROM public.manuscript_editors WHERE role_type = 'triageEditor'::text) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_manuscript_editors_triageEditor_manuscript_custom_id ON temp_manuscript_editors_triageEditor(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_manuscript_editors_academicEditor;
	CREATE TEMP TABLE temp_manuscript_editors_academicEditor AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id ORDER BY i.invited_date DESC NULLS LAST, i.accepted_date DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.manuscript_editors WHERE role_type = 'academicEditor'::text) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_manuscript_editors_academicEditor_manuscript_custom_id ON temp_manuscript_editors_academicEditor(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_manuscript_editors_editorialAssistant;
	CREATE TEMP TABLE temp_manuscript_editors_editorialAssistant AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id) as rn
			FROM (SELECT * FROM public.manuscript_editors WHERE role_type = 'editorialAssistant'::text) i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_manuscript_editors_Assistant_man_cust_id ON temp_manuscript_editors_editorialAssistant(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_journal_sections;
	CREATE TEMP TABLE temp_journal_sections AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.section_id) as rn
			FROM public.journal_sections i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_journal_sections_section_id ON temp_journal_sections(section_id);

	DROP TABLE IF EXISTS temp_journal_special_issues;
	CREATE TEMP TABLE temp_journal_special_issues AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.special_issue_id) as rn
			FROM public.journal_special_issues i) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_journal_special_issues_special_issue_id ON temp_journal_special_issues(special_issue_id);
	
	DROP TABLE IF EXISTS temp_MostRecentInvoices;
	CREATE TEMP TABLE temp_MostRecentInvoices AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY i.manuscript_custom_id ORDER BY i.invoice_created_date DESC NULLS LAST) as rn
			FROM public.invoices i
		where i.is_credit_note = false) ii
	WHERE ii.rn = 1;
	CREATE INDEX idx_temp_MostRecentInvoices_manuscript_custom_id ON temp_MostRecentInvoices(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_MostRecentSubmissions;
	CREATE TEMP TABLE temp_MostRecentSubmissions AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.submission_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.submission_data WHERE
				 submission_event::text = ANY (ARRAY['SubmissionQualityCheckPassed'::character varying::text, 'SubmissionWithdrawn'::character varying::text, 'SubmissionScreeningRTCd'::character varying::text, 'SubmissionQualityCheckRTCd'::character varying::text, 'SubmissionRejected'::character varying::text, 'SubmissionScreeningVoid'::character varying::text])
			) s) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_MostRecentSubmissions_submission_id ON temp_MostRecentSubmissions(submission_id);

	DROP TABLE IF EXISTS temp_MostRecentSubmissions2;
	CREATE TEMP TABLE temp_MostRecentSubmissions2 AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.submission_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.submission_data WHERE
				 submission_event::text = ANY (ARRAY['SubmissionSubmitted'::character varying::text, 'SubmissionScreeningReturnedToDraft'::character varying::text, 'SubmissionScreeningRTCd'::character varying::text, 'SubmissionScreeningVoid'::character varying::text, 'SubmissionScreeningPassed'::character varying::text, 'SubmissionAcademicEditorInvited'::character varying::text, 'SubmissionAcademicEditorAccepted'::character varying::text, 'SubmissionReviewerInvited'::character varying::text, 'SubmissionReviewerReportSubmitted'::character varying::text, 'SubmissionRevisionRequested'::character varying::text, 'SubmissionRevisionSubmitted'::character varying::text, 'SubmissionRecommendationToPublishMade'::character varying::text, 'SubmissionRecommendationToRejectMade'::character varying::text, 'SubmissionRejected'::character varying::text, 'SubmissionAccepted'::character varying::text, 'SubmissionQualityCheckRTCd'::character varying::text, 'SubmissionQualityCheckPassed'::character varying::text, 'SubmissionWithdrawn'::character varying::text])
			) s) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_MostRecentSubmissions2_submission_id ON temp_MostRecentSubmissions2(submission_id);

	DROP TABLE IF EXISTS temp_checker_to_submission_screener;
	CREATE TEMP TABLE temp_checker_to_submission_screener AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.submission_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.checker_to_submission WHERE checker_role = 'screener'::text) s
		) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_checker_to_submission_screener_submission_id ON temp_checker_to_submission_screener(submission_id);

	DROP TABLE IF EXISTS temp_checker_to_submission_qualityChecker;
	CREATE TEMP TABLE temp_checker_to_submission_qualityChecker AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.submission_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.checker_to_submission WHERE checker_role = 'qualityChecker'::text) s
		) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_checker_to_submission_qualityChecker_submission_id ON temp_checker_to_submission_qualityChecker(submission_id);

	DROP TABLE IF EXISTS temp_manuscript_reviews_editor;
	CREATE TEMP TABLE temp_manuscript_reviews_editor AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.manuscript_custom_id ORDER BY s.submitted_date DESC NULLS LAST) as rn
			FROM (SELECT * FROM public.manuscript_reviews WHERE team_type = 'editor'::text) s
		) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_manuscript_reviews_editor_manuscript_custom_id ON temp_manuscript_reviews_editor(manuscript_custom_id);

	DROP TABLE IF EXISTS temp_article_data;
	CREATE TEMP TABLE temp_article_data AS 
	SELECT * FROM 
		(SELECT *, 
			row_number() OVER (PARTITION BY s.manuscript_custom_id ORDER BY s.event_timestamp DESC NULLS LAST) as rn
			FROM public.article_data s
		) ss
	WHERE ss.rn = 1;
	CREATE INDEX idx_temp_article_data_manuscript_custom_id ON temp_article_data(manuscript_custom_id);

	--DROP TABLE IF EXISTS public._manuscripts;
	--CREATE TABLE public._manuscripts AS
	 TRUNCATE TABLE public._manuscripts;
	 INSERT INTO public._manuscripts
	 SELECT m.event_id,
		m.event_timestamp,
		m.submission_id,
		m.manuscript_custom_id,
		m.submission_event,
		m.article_type,
		m.version,
		m.manuscript_version_id,
		m.title,
		m.last_version_index,
		m.special_issue_id,
		m.section_id,
		m.submission_date,
		m.screening_passed_date,
		m.last_recommendation_date,
		m.last_returned_to_draft_date,
		m.screening_returned_to_draft_count::bigint,
		m.last_returned_to_editor_date,
		m.last_revision_submitted,
		m.sent_to_quality_check_date,
		m.sent_to_materials_check_date,
		m.first_decision_date,
		m.last_materials_check_files_requested_date,
		m.materials_check_files_requested_count,
		m.last_materials_check_files_submitted_date,
		m.materials_check_files_submitted_count,
		m.screening_paused_date,
		m.screening_unpaused_date,
		m.qc_paused_date,
		m.qc_unpaused_date,
		m.qc_escalated_date,
		m.peer_review_cycle_check_date,
		m.accepted_date,
		m.void_date,
		m.is_void,
		m.resubmission_date,
		m.section_name,
		m.special_issue_name,
		m.preprint_value,
		m.journal_id,
		m.journal_name,
		m.journal_apc,
		m.publisher_name,
		m.journal_code,
		m.source_journal,
		m.deleted,
		m.last_event_type,
		m.last_event_date,
		m.final_decision_date,
		m.final_decision_type,
		m.apc,
		m.submission_pricing_status,
		m.published_date,
		m.gross_apc,
		m.discount,
		m.net_apc,
		m.paid_amount,
		m.due_amount,
		m.coupons,
		m.waivers,
		m.issue_type,
		m.acceptance_chance,
		m.special_issue,
		m.special_issue_custom_id,
		m.special_issue_open_date,
		m.special_issue_closed_date,
		m.si_lead_guest_editor_name,
		m.si_lead_guest_editor_email,
		m.si_lead_guest_editor_affiliation,
		m.si_lead_guest_editor_country,
		m.si_guest_editor_count,
		m.section,
		m.corresponding_author,
		m.corresponding_author_email,
		m.corresponding_author_country,
		m.corresponding_author_affiliation,
		m.submitting_author,
		m.submitting_author_email,
		m.submitting_author_country,
		m.submitting_author_affiliation,
		m.triage_editor,
		m.triage_editor_email,
		m.triage_editor_country,
		m.triage_editor_affiliation,
		m.handling_editor,
		m.handling_editor_email,
		m.handling_editor_country,
		m.handling_editor_affiliation,
		m.handling_editor_invited_date,
		m.editorial_assistant,
		m.editorial_assistant_email,
		m.editorial_assistant_country,
		m.editorial_assistant_affiliation,
		m.screener_name,
		m.screener_email,
		m.quality_checker_name,
		m.quality_checker_email,
		m.is_paused,
		m.is_quality_check_paused,
		m.invited_reviewers_count,
		m.last_reviewer_invitation_date,
		m.first_reviewer_invitation_date,
		m.reviewer_count,
		m.accepted_reviewers_count,
		m.last_reviewer_accepted_date,
		m.first_reviewer_accepted_date,
		m.pending_reviewers_count,
		m.review_reports_count,
		m.last_review_report_submitted_date,
		m.first_review_report_submitted_date,
		m.invited_handling_editors_count,
		m.last_handling_editor_invited_date,
		m.current_handling_editor_accepted_date,
		m.last_handling_editor_declined_date,
		m.first_handling_editor_invited_date,
		m.first_handling_editor_accepted_date,
		m.last_editor_recommendation,
		m.last_editor_recommendation_submitted_date,
		m.last_requested_revision_date,
			CASE
				WHEN m.event_timestamp IS NULL THEN m.acceptance_chance::double precision * COALESCE(m.net_apc, m.journal_apc::double precision)
				ELSE m.net_apc
			END AS current_expected_revenue,
		m.acceptance_chance::double precision * COALESCE(m.net_apc, m.journal_apc::double precision) AS raw_expected_revenue
	   FROM ( SELECT s.event_id,
				s.event_timestamp,
				s.submission_id,
				s.manuscript_custom_id,
				s.submission_event,
				s.article_type,
				s.version,
				s.manuscript_version_id,
				s.title,
				s.last_version_index,
				s.special_issue_id,
				s.section_id,
				s.submission_date,
				s.screening_passed_date,
				s.last_recommendation_date,
				s.last_returned_to_draft_date,
				s.screening_returned_to_draft_count,
				s.last_returned_to_editor_date,
				s.last_revision_submitted,
				s.sent_to_quality_check_date,
				s.sent_to_materials_check_date,
				s.first_decision_date,
				s.last_materials_check_files_requested_date,
				s.materials_check_files_requested_count,
				s.last_materials_check_files_submitted_date,
				s.materials_check_files_submitted_count,
				s.screening_paused_date,
				s.screening_unpaused_date,
				s.qc_paused_date,
				s.qc_unpaused_date,
				s.qc_escalated_date,
				s.peer_review_cycle_check_date,
				s.accepted_date,
				s.void_date,
				s.is_void,
				s.resubmission_date,
				s.section_name,
				s.special_issue_name,
				s.preprint_value,
				s.journal_id,
				s.journal_name,
				s.journal_apc,
				s.publisher_name,
				s.journal_code,
				s.source_journal,
				deleted_manuscripts.manuscript_custom_id IS NOT NULL AS deleted,
				last_sd.submission_event AS last_event_type,
				last_sd.event_timestamp AS last_event_date,
				sd.event_timestamp AS final_decision_date,
				sd.submission_event AS final_decision_type,
					CASE
						WHEN i.apc IS NOT NULL THEN i.apc
						WHEN s.article_type = ANY (ARRAY['Editorial'::text, 'Corrigendum'::text, 'Erratum'::text, 'Retraction'::text, 'Letter to the Editor'::text]) THEN 'free'::text
						ELSE 'paid'::text
					END AS apc,
					CASE
						WHEN i.submission_pricing_status IS NOT NULL THEN i.submission_pricing_status
						WHEN s.article_type = ANY (ARRAY['Editorial'::text, 'Corrigendum'::text, 'Erratum'::text, 'Retraction'::text, 'Letter to the Editor'::text]) THEN 'non-priced'::text
						ELSE 'priced'::text
					END AS submission_pricing_status,
				article_data.published_date,
				COALESCE(i.gross_apc_value, s.journal_apc::double precision) AS gross_apc,
				i.discount,
				i.net_apc,
				i.paid_amount,
				i.due_amount,
				i.coupons,
				i.waivers,
					CASE
						WHEN s.special_issue_id IS NULL THEN 'regular'::text
						ELSE 'special'::text
					END AS issue_type,
					CASE
						WHEN i.submission_pricing_status IS NULL AND (s.article_type = ANY (ARRAY['Editorial'::text, 'Corrigendum'::text, 'Erratum'::text, 'Retraction'::text, 'Letter to the Editor'::text])) THEN COALESCE(individual_ar.free_rate, avg_rate.journal_rate, individual_ar.journal_rate)
						WHEN i.submission_pricing_status = 'non-priced'::text THEN COALESCE(individual_ar.free_rate, avg_rate.journal_rate, individual_ar.journal_rate)
						WHEN s.special_issue_id IS NULL THEN COALESCE(individual_ar.paid_regular_rate, avg_rate.paid_regular_rate, individual_ar.journal_rate)
						WHEN s.special_issue_id IS NOT NULL THEN COALESCE(individual_ar.paid_special_issue_rate, avg_rate.paid_special_issue_rate, individual_ar.journal_rate)
						ELSE COALESCE(individual_ar.journal_rate, avg_rate.journal_rate)
					END AS acceptance_chance,
				spec.special_issue_name AS special_issue,
				spec.special_issue_custom_id,
				spec.open_date AS special_issue_open_date,
				spec.closed_date AS special_issue_closed_date,
				spec.lead_guest_editor_name AS si_lead_guest_editor_name,
				spec.lead_guest_editor_email AS si_lead_guest_editor_email,
				spec.lead_guest_editor_affiliation AS si_lead_guest_editor_affiliation,
				spec.lead_guest_editor_country AS si_lead_guest_editor_country,
				spec.editor_count AS si_guest_editor_count,
				sec.section_name AS section,
				concat(a.given_names, ' ', a.surname) AS corresponding_author,
				a.email AS corresponding_author_email,
				a.country AS corresponding_author_country,
				a.aff AS corresponding_author_affiliation,
				concat(a2.given_names, ' ', a2.surname) AS submitting_author,
				a2.email AS submitting_author_email,
				a2.country AS submitting_author_country,
				a2.aff AS submitting_author_affiliation,
				concat(e.given_names, ' ', e.surname) AS triage_editor,
				e.email AS triage_editor_email,
				e.country AS triage_editor_country,
				e.aff AS triage_editor_affiliation,
				concat(e2.given_names, ' ', e2.surname) AS handling_editor,
				e2.email AS handling_editor_email,
				e2.country AS handling_editor_country,
				e2.aff AS handling_editor_affiliation,
				e2.invited_date AS handling_editor_invited_date,
				concat(e3.given_names, ' ', e3.surname) AS editorial_assistant,
				e3.email AS editorial_assistant_email,
				e3.country AS editorial_assistant_country,
				e3.aff AS editorial_assistant_affiliation,
				screener.checker_name AS screener_name,
				screener.checker_email AS screener_email,
				quality_checker.checker_name AS quality_checker_name,
				quality_checker.checker_email AS quality_checker_email,
				COALESCE(s.screening_paused_date, '1900-01-01 00:00:00'::timestamp without time zone::timestamp with time zone) > COALESCE(s.screening_unpaused_date, '1901-01-01 00:00:00'::timestamp without time zone::timestamp with time zone) AS is_paused,
				COALESCE(s.qc_paused_date, '1900-01-01 00:00:00'::timestamp without time zone::timestamp with time zone) > COALESCE(s.qc_unpaused_date, '1901-01-01 00:00:00'::timestamp without time zone::timestamp with time zone) AS is_quality_check_paused,
				reviewers.invited_reviewers_count,
				reviewers.last_reviewer_invitation_date,
				reviewers.first_reviewer_invitation_date,
				submitting_reviewers.reviewer_count,
				accepted_reviewers.accepted_reviewers_count,
				accepted_reviewers.last_reviewer_accepted_date,
				accepted_reviewers.first_reviewer_accepted_date,
				pending_reviewers.pending_reviewers_count,
				review_reports.review_reports_count,
				review_reports.last_review_report_submitted_date,
				review_reports.first_review_report_submitted_date,
				handling_editors.invited_handling_editors_count,
				handling_editors.last_handling_editor_invited_date,
				handling_editors.current_handling_editor_accepted_date,
				handling_editors.last_handling_editor_declined_date,
				handling_editors.first_handling_editor_invited_date,
				handling_editors.first_handling_editor_accepted_date,
				last_editor_recommendation.recommendation AS last_editor_recommendation,
				last_editor_recommendation.submitted_date AS last_editor_recommendation_submitted_date,
				submission_revision_requested_dates.max AS last_requested_revision_date
			   FROM public.submissions s

			   LEFT JOIN temp_authors_is_corresponding a ON a.manuscript_custom_id = s.manuscript_custom_id
			   LEFT JOIN temp_authors_is_submitting a2 ON a2.manuscript_custom_id = s.manuscript_custom_id
			   LEFT JOIN temp_manuscript_editors_triageEditor e ON e.manuscript_custom_id = s.manuscript_custom_id
			   LEFT JOIN temp_manuscript_editors_academicEditor e2 ON e2.manuscript_custom_id = s.manuscript_custom_id
			   LEFT JOIN temp_manuscript_editors_editorialAssistant e3 ON e3.manuscript_custom_id = s.manuscript_custom_id 
			   LEFT JOIN temp_journal_sections sec ON sec.section_id = s.section_id
			   LEFT JOIN temp_journal_special_issues spec ON spec.special_issue_id = s.special_issue_id
	------------------------------------------------------------------
			   LEFT JOIN temp_MostRecentInvoices i ON i.manuscript_custom_id = s.manuscript_custom_id 
			   LEFT JOIN temp_MostRecentSubmissions sd ON sd.submission_id = s.submission_id
			   LEFT JOIN temp_MostRecentSubmissions2 last_sd ON last_sd.submission_id = s.submission_id
			   LEFT JOIN ( SELECT submission_data.submission_id,
						max(submission_data.event_timestamp) AS max
					   FROM submission_data
					  WHERE submission_data.submission_event::text = 'SubmissionRevisionRequested'::text
					  GROUP BY submission_data.submission_id) submission_revision_requested_dates ON submission_revision_requested_dates.submission_id = s.submission_id
				 LEFT JOIN temp_checker_to_submission_screener screener ON screener.submission_id = s.submission_id
				 LEFT JOIN temp_checker_to_submission_qualityChecker quality_checker ON quality_checker.submission_id = s.submission_id
				 LEFT JOIN temp_manuscript_reviews_editor last_editor_recommendation ON last_editor_recommendation.manuscript_custom_id = s.manuscript_custom_id
				 LEFT JOIN ( SELECT manuscript_reviewers.manuscript_custom_id,
						manuscript_reviewers.version,
						count(*) AS invited_reviewers_count,
						max(manuscript_reviewers.invited_date) AS last_reviewer_invitation_date,
						min(manuscript_reviewers.invited_date) AS first_reviewer_invitation_date
					   FROM public.manuscript_reviewers
					  GROUP BY manuscript_reviewers.manuscript_custom_id, manuscript_reviewers.version) reviewers ON reviewers.manuscript_custom_id = s.manuscript_custom_id AND reviewers.version = s.version
				 LEFT JOIN ( SELECT manuscript_reviewers.manuscript_custom_id,
						count(DISTINCT manuscript_reviewers.email) AS reviewer_count
					   FROM public.manuscript_reviewers
					  WHERE manuscript_reviewers.status = 'submitted'::text
					  GROUP BY manuscript_reviewers.manuscript_custom_id) submitting_reviewers ON submitting_reviewers.manuscript_custom_id = s.manuscript_custom_id
				 LEFT JOIN ( SELECT manuscript_reviewers.manuscript_custom_id,
						manuscript_reviewers.version,
						count(*) AS accepted_reviewers_count,
						min(manuscript_reviewers.accepted_date) AS first_reviewer_accepted_date,
						max(manuscript_reviewers.accepted_date) AS last_reviewer_accepted_date
					   FROM public.manuscript_reviewers
					  WHERE manuscript_reviewers.status = 'accepted'::text
					  GROUP BY manuscript_reviewers.manuscript_custom_id, manuscript_reviewers.version) accepted_reviewers ON accepted_reviewers.manuscript_custom_id = s.manuscript_custom_id AND accepted_reviewers.version = s.version
				 LEFT JOIN ( SELECT manuscript_reviewers.manuscript_custom_id,
						manuscript_reviewers.version,
						count(*) AS pending_reviewers_count
					   FROM public.manuscript_reviewers
					  WHERE manuscript_reviewers.responded_date IS NULL
					  GROUP BY manuscript_reviewers.manuscript_custom_id, manuscript_reviewers.version) pending_reviewers ON pending_reviewers.manuscript_custom_id = s.manuscript_custom_id AND pending_reviewers.version = s.version
				 LEFT JOIN ( SELECT manuscript_reviews.manuscript_custom_id,
						manuscript_reviews.version,
						count(*) AS review_reports_count,
						max(manuscript_reviews.submitted_date) AS last_review_report_submitted_date,
						min(manuscript_reviews.submitted_date) AS first_review_report_submitted_date
					   FROM public.manuscript_reviews
					  WHERE manuscript_reviews.recommendation = ANY (ARRAY['publish'::text, 'reject'::text, 'minor'::text, 'major'::text])
					  GROUP BY manuscript_reviews.manuscript_custom_id, manuscript_reviews.version) review_reports ON review_reports.manuscript_custom_id = s.manuscript_custom_id AND review_reports.version = s.version
				 LEFT JOIN ( SELECT manuscript_editors.manuscript_custom_id,
						count(*) AS invited_handling_editors_count,
						min(manuscript_editors.invited_date) AS first_handling_editor_invited_date,
						max(manuscript_editors.invited_date) AS last_handling_editor_invited_date,
						min(manuscript_editors.accepted_date) AS first_handling_editor_accepted_date,
						max(manuscript_editors.accepted_date) AS current_handling_editor_accepted_date,
						max(manuscript_editors.declined_date) AS last_handling_editor_declined_date
					   FROM public.manuscript_editors
					  WHERE manuscript_editors.role_type = 'academicEditor'::text
					  GROUP BY manuscript_editors.manuscript_custom_id) handling_editors ON handling_editors.manuscript_custom_id = s.manuscript_custom_id
				 LEFT JOIN acceptance_rates individual_ar ON individual_ar.month = to_char(s.submission_date, 'YYYY-MM-01'::text)::date AND s.journal_id = individual_ar.journal_id
				 LEFT JOIN ( SELECT acceptance_rates.journal_id,
						avg(acceptance_rates.journal_rate) AS journal_rate,
						avg(acceptance_rates.paid_regular_rate) AS paid_regular_rate,
						avg(acceptance_rates.paid_special_issue_rate) AS paid_special_issue_rate
					   FROM acceptance_rates
					  GROUP BY acceptance_rates.journal_id) avg_rate ON avg_rate.journal_id = s.journal_id
				 LEFT JOIN temp_article_data article_data ON article_data.manuscript_custom_id = s.manuscript_custom_id
				 LEFT JOIN LATERAL ( SELECT d.manuscript_custom_id,
						d.reason
					   FROM deleted_manuscripts d
					  WHERE d.manuscript_custom_id::text = s.manuscript_custom_id
					 LIMIT 1) deleted_manuscripts ON deleted_manuscripts.manuscript_custom_id::text = s.manuscript_custom_id) m;

	DROP TABLE IF EXISTS temp_authors_is_corresponding;
	DROP TABLE IF EXISTS temp_authors_is_submitting;
	DROP TABLE IF EXISTS temp_manuscript_editors_triageEditor;
	DROP TABLE IF EXISTS temp_manuscript_editors_academicEditor;
	DROP TABLE IF EXISTS temp_manuscript_editors_editorialAssistant;
	DROP TABLE IF EXISTS temp_journal_sections;
	DROP TABLE IF EXISTS temp_journal_special_issues;
	DROP TABLE IF EXISTS temp_MostRecentInvoices;
	DROP TABLE IF EXISTS temp_MostRecentSubmissions;
	DROP TABLE IF EXISTS temp_MostRecentSubmissions2;
	DROP TABLE IF EXISTS temp_checker_to_submission_screener;
	DROP TABLE IF EXISTS temp_checker_to_submission_qualityChecker;
	DROP TABLE IF EXISTS temp_manuscript_reviews_editor;
	DROP TABLE IF EXISTS temp_article_data;

	raise notice '% DONE', clock_timestamp();
end;
$BODY$;


-- PROCEDURE: public.sp_refresh_submissions_as_table()

-- DROP PROCEDURE IF EXISTS public.sp_refresh_submissions_as_table();

CREATE OR REPLACE PROCEDURE public.sp_refresh_submissions_as_table(
	)
LANGUAGE 'plpgsql'
AS $BODY$
begin
	raise notice '% START', clock_timestamp();
	
	
	DROP TABLE IF EXISTS temp_submission_facts;
	CREATE TEMP TABLE temp_submission_facts
	(
		submission_id text NOT NULL,
		submission_event_type text not null,
		submission_min_timestamp timestamp with time zone not null,
		submission_max_timestamp timestamp with time zone not null,
		submission_count bigint not null,
		CONSTRAINT submission_facts_pkey PRIMARY KEY (submission_id, submission_event_type)
	);
	
	-- make sure this exists
	--CREATE INDEX submission_data_sid_sevent_stimestamp_idx
    --ON public.submission_data(submission_id, submission_event, event_timestamp)
	INSERT INTO temp_submission_facts(
		submission_id, submission_event_type, submission_min_timestamp, submission_max_timestamp, submission_count)
	SELECT 
		coalesce(s.submission_id, 'b0e79e4b-ce3c-57ea-c3f9-87971cf6b27c') submission_id,
		s.submission_event submission_event,
		min(s.event_timestamp) AS submission_min_timestamp,
		max(s.event_timestamp) AS submission_max_timestamp,		
		count(*) AS submission_event_count
	FROM 
		submission_data s
	GROUP BY 
		submission_id, submission_event;

	
	DROP TABLE IF EXISTS temp_submission_facts_dates;
	CREATE TEMP TABLE temp_submission_facts_dates
	(
		submission_id text NOT NULL,
		submission_date timestamp with time zone,
		resubmission_date timestamp with time zone,
		screening_passed_date timestamp with time zone,
		last_recommendation_date timestamp with time zone,
		sent_to_quality_check_date timestamp with time zone,
		sent_to_materials_check_date timestamp with time zone,
		first_decision_date timestamp with time zone,
		last_materials_check_files_requested_date timestamp with time zone,
		materials_check_files_requested_count bigint,
		last_materials_check_files_submitted_date timestamp with time zone,
		materials_check_files_submitted_count bigint,
		screening_paused_date timestamp with time zone,
		screening_unpaused_date timestamp with time zone,
		qc_paused_date timestamp with time zone,
		qc_unpaused_date timestamp with time zone,
		qc_escalated_date timestamp with time zone,
		peer_review_cycle_check_date timestamp with time zone,
		accepted_date timestamp with time zone,
		void_date timestamp with time zone,
		is_void boolean,
		CONSTRAINT submission_facts_dates_pkey PRIMARY KEY (submission_id)
	);

	INSERT INTO temp_submission_facts_dates(
		submission_id, submission_date, resubmission_date, screening_passed_date, last_recommendation_date, sent_to_quality_check_date, sent_to_materials_check_date, first_decision_date, last_materials_check_files_requested_date, materials_check_files_requested_count, last_materials_check_files_submitted_date, materials_check_files_submitted_count, screening_paused_date, screening_unpaused_date, qc_paused_date, qc_unpaused_date, qc_escalated_date, peer_review_cycle_check_date, accepted_date, void_date, is_void)
	SELECT
		s.submission_id AS submission_id,
		submission_submitted_dates.submission_min_timestamp AS submission_date,
		CASE
			WHEN submission_submitted_dates.submission_count = 1 THEN NULL::timestamp with time zone
			ELSE submission_submitted_dates.submission_max_timestamp
		END AS resubmission_date,
		screening_passed_dates.submission_max_timestamp AS screening_passed_date,
		recommendation_dates.submission_max_timestamp AS last_recommendation_date,

		--screening_draft_dates.submission_max_timestamp AS last_returned_to_draft_date,
		--screening_draft_dates.submission_count AS screening_returned_to_draft_count,
		--returned_to_editor_dates.submission_max_timestamp AS last_returned_to_editor_date,
		--revision_dates.submission_max_timestamp AS last_revision_submitted,

		submission_accepted_dates.submission_max_timestamp AS sent_to_quality_check_date,
		peer_review_dates.submission_max_timestamp AS sent_to_materials_check_date,
		revision_requested_dates.submission_min_timestamp AS first_decision_date,
		materials_check_files_requested_dates.submission_max_timestamp AS last_materials_check_files_requested_date,
		materials_check_files_requested_dates.submission_count AS materials_check_files_requested_count,
		materials_check_files_submitted_dates.submission_max_timestamp AS last_materials_check_files_submitted_date,
		materials_check_files_submitted_dates.submission_count AS materials_check_files_submitted_count,
		paused_dates.submission_max_timestamp AS screening_paused_date,
		unpaused_dates.submission_max_timestamp AS screening_unpaused_date,
		qc_paused_dates.submission_max_timestamp AS qc_paused_date,
		qc_unpaused_dates.submission_max_timestamp AS qc_unpaused_date,
		qc_escalated_dates.submission_max_timestamp AS qc_escalated_date,
		peer_review_cycle_check_dates.submission_max_timestamp AS peer_review_cycle_check_date,
		accepted_dates.submission_min_timestamp AS accepted_date,
		void_dates.submission_max_timestamp AS void_date,
		void_dates.submission_max_timestamp IS NOT NULL AS is_void
	FROM
	(
		SELECT DISTINCT submission_id FROM temp_submission_facts 
	) s
	INNER JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionSubmitted'
	) submission_submitted_dates ON submission_submitted_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionScreeningPassed'
	) screening_passed_dates ON screening_passed_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT 
			submission_id,
			min(submission_min_timestamp) submission_min_timestamp,
			max(submission_max_timestamp) submission_max_timestamp
			FROM temp_submission_facts 
		WHERE 
		submission_event_type = 'SubmissionAccepted' OR submission_event_type::text ~~ 'SubmissionRecommendation%'::text
		group by submission_id
	) recommendation_dates ON recommendation_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionAccepted'
	) submission_accepted_dates ON submission_accepted_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionPeerReviewCycleCheckPassed'
	) peer_review_dates ON peer_review_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionQualityCheckFilesRequested'
	) materials_check_files_requested_dates ON materials_check_files_requested_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionQualityChecksSubmitted'
	) materials_check_files_submitted_dates ON materials_check_files_submitted_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionRevisionRequested'
	) revision_requested_dates ON revision_requested_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionScreeningVoid'
	) void_dates ON void_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionScreeningPaused'
	) paused_dates ON paused_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionScreeningUnpaused'
	) unpaused_dates ON unpaused_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionQualityCheckingPaused'
	) qc_paused_dates ON qc_paused_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionQualityCheckingUnpaused'
	) qc_unpaused_dates ON qc_unpaused_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT * FROM temp_submission_facts 
		WHERE submission_event_type = 'SubmissionQualityCheckingEscalated'
	) qc_escalated_dates ON qc_escalated_dates.submission_id = s.submission_id
	LEFT JOIN
	(
		SELECT 
			submission_id,
			min(submission_min_timestamp) submission_min_timestamp,
			max(submission_max_timestamp) submission_max_timestamp
		FROM temp_submission_facts 
		WHERE submission_event_type = ANY (ARRAY['SubmissionQualityCheckPassed'::character varying::text, 'SubmissionPeerReviewCycleCheckPassed'::character varying::text])
		GROUP BY submission_id
	) accepted_dates ON accepted_dates.submission_id = s.submission_id
	-- beware, this is joining with peer_review_data 	
	LEFT JOIN ( 
		SELECT 
			peer_review_data.submission_id,
			max(peer_review_data.event_timestamp) AS submission_max_timestamp
		FROM public.peer_review_data
		WHERE public.peer_review_data.peer_review_event::text = 'PeerReviewCycleCheckingProcessSentToPeerReview'::text
	GROUP BY public.peer_review_data.submission_id) peer_review_cycle_check_dates ON peer_review_cycle_check_dates.submission_id = s.submission_id;

	DROP TABLE IF EXISTS temp_submission_version_facts;
	CREATE TEMP TABLE temp_submission_version_facts
	(
		submission_id text NOT NULL,
		submission_event_type text not null,
		submission_version text not null,
		submission_min_timestamp timestamp with time zone not null,
		submission_max_timestamp timestamp with time zone not null,
		submission_count bigint not null,
		CONSTRAINT submission_version_facts_pkey PRIMARY KEY (submission_id, submission_event_type, submission_version)
	);

	-- make sure this exists
	--CREATE INDEX submission_data_sid_sevent_sversion_stimestamp_idx
    --ON public.submission_data(submission_id, submission_event, version, event_timestamp)
	INSERT INTO temp_submission_version_facts(
		submission_id, submission_event_type, submission_version, submission_min_timestamp, submission_max_timestamp, submission_count)
	SELECT 
		coalesce(s.submission_id, 'b0e79e4b-ce3c-57ea-c3f9-87971cf6b27c') submission_id,
		s.submission_event submission_event,
		coalesce(s.version, '1') submission_version,
		min(s.event_timestamp) AS event_timestamp,
		max(s.event_timestamp) AS event_timestamp,
		count(*)::bigint AS submission_event_count
	FROM 
		submission_data s
	GROUP BY submission_id, submission_event, submission_version;

	DROP TABLE IF EXISTS temp_submission_version_facts_dates;
	CREATE TEMP TABLE temp_submission_version_facts_dates
	(
		submission_id text NOT NULL,
		submission_version text NOT NULL,
		last_returned_to_draft_date timestamp with time zone,
		screening_returned_to_draft_count bigint,
		last_returned_to_editor_date timestamp with time zone,
		last_revision_submitted timestamp with time zone,
		CONSTRAINT submission_version_facts_dates_pkey PRIMARY KEY (submission_id, submission_version)
	);

	INSERT INTO temp_submission_version_facts_dates(
		submission_id, submission_version, last_returned_to_draft_date, screening_returned_to_draft_count, last_returned_to_editor_date, last_revision_submitted)
	SELECT
		sv.submission_id AS submission_id,
		sv.submission_version AS submission_version,
		screening_draft_dates.submission_max_timestamp AS last_returned_to_draft_date,
		screening_draft_dates.submission_count AS screening_returned_to_draft_count,
		returned_to_editor_dates.submission_max_timestamp AS last_returned_to_editor_date,
		revision_dates.submission_max_timestamp AS last_revision_submitted
	FROM
	(
		SELECT DISTINCT submission_id, submission_version 
		FROM 
		temp_submission_version_facts 
	) sv
	LEFT JOIN
	(
		SELECT * FROM temp_submission_version_facts 
		WHERE submission_event_type = 'SubmissionRevisionSubmitted'
	) revision_dates 
		ON revision_dates.submission_id = sv.submission_id 
		AND revision_dates.submission_version = sv.submission_version
	LEFT JOIN
	(
		SELECT * FROM temp_submission_version_facts
		WHERE submission_event_type = 'SubmissionScreeningReturnedToDraft'
	) screening_draft_dates
		ON screening_draft_dates.submission_id = sv.submission_id 
		AND screening_draft_dates.submission_version = sv.submission_version
	LEFT JOIN
	(
		SELECT * FROM temp_submission_version_facts
		WHERE submission_event_type = 'SubmissionReturnedToAcademicEditor'
	) returned_to_editor_dates 
		ON returned_to_editor_dates.submission_id = sv.submission_id 
		AND returned_to_editor_dates.submission_version = sv.submission_version;

	DROP TABLE IF EXISTS temp_submission_data_last;
	CREATE TEMP TABLE temp_submission_data_last
	(
		event_id uuid,
		event_timestamp timestamp with time zone,
		submission_event character varying(255) COLLATE pg_catalog."default",
		submission_id text COLLATE pg_catalog."default",
		manuscript_custom_id text COLLATE pg_catalog."default",
		article_type text COLLATE pg_catalog."default",
		journal_id text COLLATE pg_catalog."default",
		title text COLLATE pg_catalog."default",
		special_issue_id text COLLATE pg_catalog."default",
		section_id text COLLATE pg_catalog."default",
		version text COLLATE pg_catalog."default",
		manuscript_version_id text COLLATE pg_catalog."default",
		last_version_index integer,
		preprint_value text COLLATE pg_catalog."default",
		source_journal text COLLATE pg_catalog."default",
		is_last_manuscript_custom_id boolean
	);
	
	INSERT INTO temp_submission_data_last 
	SELECT * from submission_data WHERE event_id IN
		((SELECT t.event_id FROM 
		 ( SELECT sd.event_id, 
		  		  row_number() OVER (PARTITION BY sd.manuscript_custom_id ORDER BY sd.event_timestamp DESC NULLS LAST, sd.last_version_index::int DESC NULLS LAST, sd.event_id NULLS LAST) AS rn
			FROM ( SELECT s_1.event_id as event_id, 
							s_1.event_timestamp as event_timestamp, 
							s_1.manuscript_custom_id as manuscript_custom_id,
				  			s_1.last_version_index as last_version_index
					  FROM submission_data s_1
					  WHERE 
							s_1.manuscript_custom_id IS NOT NULL 
							AND s_1.submission_event::text !~~ 'SubmissionQualityCheck%'::text 
							AND s_1.submission_event::text !~~ 'SubmissionScreening%'::text 
							AND s_1.submission_event::text <> 'SubmissionPeerReviewCycleCheckPassed'::text
				 ) sd ) t 
		 WHERE t.rn = 1));

	CREATE INDEX apollo1_temp_submission_data_last_submission_id_index
		ON temp_submission_data_last (submission_id);

	DROP TABLE IF EXISTS temp_journal_sections_unique;
	CREATE TEMP TABLE temp_journal_sections_unique
	(
		section_id text,
		section_name text
	);
	INSERT INTO temp_journal_sections_unique
	SELECT DISTINCT section_id, section_name FROM public.journal_sections;

	DROP TABLE IF EXISTS temp_journal_special_issues_unique;
	CREATE TEMP TABLE temp_journal_special_issues_unique
	(
		special_issue_id text,
		special_issue_name text
	);
	INSERT INTO temp_journal_special_issues_unique
	SELECT DISTINCT special_issue_id, special_issue_name FROM public.journal_special_issues;

	TRUNCATE TABLE public._submissions;

	INSERT into public._submissions
	SELECT s.event_id,
		s.event_timestamp,
		s.submission_id,
		s.manuscript_custom_id,
		s.submission_event,
		s.article_type,
		s.version,
		s.manuscript_version_id,
		s.title,
		s.last_version_index,
		s.special_issue_id,
		s.section_id,
		facts_dates.submission_date,
		facts_dates.screening_passed_date,
		facts_dates.last_recommendation_date,
		version_facts_dates.last_returned_to_draft_date,
		version_facts_dates.screening_returned_to_draft_count::bigint,
		version_facts_dates.last_returned_to_editor_date,
		version_facts_dates.last_revision_submitted,
		facts_dates.sent_to_quality_check_date,
		facts_dates.sent_to_materials_check_date,
		facts_dates.first_decision_date,
		facts_dates.last_materials_check_files_requested_date,
		facts_dates.materials_check_files_requested_count,
		facts_dates.last_materials_check_files_submitted_date,
		facts_dates.materials_check_files_submitted_count,
		facts_dates.screening_paused_date,
		facts_dates.screening_unpaused_date,
		facts_dates.qc_paused_date,
		facts_dates.qc_unpaused_date,
		facts_dates.qc_escalated_date,
		facts_dates.peer_review_cycle_check_date,
		facts_dates.accepted_date,
		facts_dates.void_date,
		facts_dates.is_void,
		facts_dates.resubmission_date,
		sec.section_name,
		spec.special_issue_name,
			CASE
				WHEN s.preprint_value = 'null'::text THEN NULL::text
				ELSE s.preprint_value
			END AS preprint_value,
		j.journal_id,
		j.journal_name,
		j.apc AS journal_apc,
		j.publisher_name,
		j.journal_code,
		CASE
			WHEN s.source_journal = 'null'::text THEN NULL::text
			ELSE s.source_journal
		END AS source_journal
	FROM temp_submission_data_last s
-- 	FROM public.submission_data_most_recent s
		 JOIN temp_submission_facts_dates facts_dates ON facts_dates.submission_id = s.submission_id
		 LEFT JOIN temp_submission_version_facts_dates version_facts_dates ON version_facts_dates.submission_id = s.submission_id AND version_facts_dates.submission_version = s.version
		 LEFT JOIN public.journals j ON s.journal_id = j.journal_id
		 LEFT JOIN temp_journal_sections_unique sec ON sec.section_id = s.section_id
		 LEFT JOIN temp_journal_special_issues_unique spec ON spec.special_issue_id = s.special_issue_id
	;

	DROP TABLE IF EXISTS temp_submission_facts;
	DROP TABLE IF EXISTS temp_submission_facts_dates;
	DROP TABLE IF EXISTS temp_submission_version_facts;
	DROP TABLE IF EXISTS temp_submission_version_facts_dates;
	DROP TABLE IF EXISTS temp_submission_data_last;
	DROP TABLE IF EXISTS temp_journal_sections_unique;
	DROP TABLE IF EXISTS temp_journal_special_issues_unique;
	
	raise notice '% DONE', clock_timestamp();

end;
$BODY$;

-- ///////////////////////////////////////////////////////////////////////////
-- DROP, CREATE AND REFRESH MATERIALIZED VIEWS
-- ///////////////////////////////////////////////////////////////////////////

-- PROCEDURE: public.drop_all_materialized_views()

-- DROP PROCEDURE IF EXISTS public.drop_all_materialized_views();

CREATE OR REPLACE PROCEDURE public.drop_all_materialized_views(
	)
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
 	drop view if exists public.manuscript_vendors_full_access;
 	drop view if exists public.manuscript_vendors;
	drop materialized view if exists public.manuscript_users;
	drop materialized view if exists public.checker_to_team;
	drop materialized view if exists public.manuscripts;
	drop materialized view if exists public.users_data;
	drop materialized view if exists public.invoices;
	drop materialized view if exists public.manuscript_reviews;
	drop materialized view if exists public.payments;
	drop materialized view if exists public.manuscript_editors;
	drop materialized view if exists public.manuscript_reviewers;
	drop materialized view if exists public.invoices_data;
	drop materialized view if exists public.article_data;
	drop materialized view if exists public.authors;
	drop materialized view if exists public.submissions;
	drop materialized view if exists public.checker_team_data;
	drop materialized view if exists public.checker_to_submission;
	drop materialized view if exists public.journal_special_issues;
	drop materialized view if exists public.peer_review_data;
	drop materialized view if exists public.checker_submission_data;
	drop materialized view if exists public.journal_editorial_board;
	drop materialized view if exists public.journal_special_issues_data;
	drop materialized view if exists public.journal_sections;
	drop materialized view if exists public.journals;
	drop materialized view if exists public.journals_data;
END
$BODY$;



-- PROCEDURE: public.create_materialized_views_no_data()

-- DROP PROCEDURE IF EXISTS public.create_materialized_views_no_data();

CREATE OR REPLACE PROCEDURE public.create_materialized_views_no_data(
	)
LANGUAGE 'plpgsql'
AS $BODY$
BEGIN
	call public.create_journals_data();
	call public.create_journals();
	call public.create_journal_sections();
	call public.create_journal_special_issues_data();
	call public.create_journal_editorial_board();
	call public.create_checker_submission_data();
	call public.create_peer_review_data();
	call public.create_journal_special_issues();
	call public.create_checker_to_submission();
	call public.create_checker_team_data();
	call public.create_submissions();
	call public.create_authors();
	call public.create_article_data();
	call public.create_invoices_data();
	call public.create_manuscript_reviewers();
	call public.create_manuscript_editors();
	call public.create_payments();
	call public.create_manuscript_reviews();
	call public.create_invoices();
	call public.create_users_data();
	call public.create_manuscripts();
	call public.create_checker_to_team();
	call public.create_manuscript_users();
END
$BODY$;



-- PROCEDURE: public.refresh_materialized_views()

-- DROP PROCEDURE IF EXISTS public.refresh_materialized_views();

CREATE OR REPLACE PROCEDURE public.refresh_all_materialized_views(
	)
LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
	vStartTimeProcedure timestamp;
	vStartTime timestamp;
	vRefreshId uuid;
BEGIN
	vStartTimeProcedure = clock_timestamp();

	vRefreshId = md5(random()::text || clock_timestamp()::text)::uuid;

	call public.sp_log(vRefreshId, clock_timestamp(), 'public.refresh_mat_views_log start');

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
	refresh materialized view public.journal_editorial_board;
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
	refresh materialized view public.submissions;
	call public.sp_log(vRefreshId, clock_timestamp(), 'submissions', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.authors;
	call public.sp_log(vRefreshId, clock_timestamp(), 'authors', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.article_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'article_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.invoices_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'invoices_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.manuscript_reviewers;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscript_reviewers', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.manuscript_editors;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscript_editors', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.payments;
	call public.sp_log(vRefreshId, clock_timestamp(), 'payments', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.manuscript_reviews;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscript_reviews', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	call public.sp_refresh_invoices_as_table();
	refresh materialized view public.invoices;
	call public.sp_log(vRefreshId, clock_timestamp(), 'invoices', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	refresh materialized view public.users_data;
	call public.sp_log(vRefreshId, clock_timestamp(), 'users_data', clock_timestamp() - vStartTime);
	commit;

	vStartTime = clock_timestamp();
	call public.sp_refresh_manuscripts_as_table();
	refresh materialized view public.manuscripts;
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
$BODY$; `;


export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(viewsTriggersFunctionsCreate),
	]);
  }
  
  export async function down(knex: Knex): Promise<any> {
  }

  export const name = '20220304121300_02_migration_views_triggers_functions_create';
