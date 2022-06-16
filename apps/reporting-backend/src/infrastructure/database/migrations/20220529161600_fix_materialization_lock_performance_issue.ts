import * as Knex from 'knex';

const create_authors_table = `
CREATE UNLOGGED TABLE public."_authors" (
	id text NULL,
	manuscript_custom_id text NULL,
	email text NULL,
	country varchar NULL,
	is_corresponding bool NULL,
	is_submitting bool NULL,
	user_id text NULL,
	given_names text NULL,
	surname text NULL,
	aff text NULL,
	event_id uuid NULL
);
`
const create_manuscript_editors_table = `
CREATE UNLOGGED TABLE public."_manuscript_editors" (
	id text NULL,
	manuscript_custom_id text NULL,
	journal_name text NULL,
	section_name text NULL,
	special_issue_name text NULL,
	special_issue_id text NULL,
	email text NULL,
	expired_date timestamp NULL,
	invited_date timestamp NULL,
	removed_date timestamp NULL,
	accepted_date timestamp NULL,
	assigned_date timestamp NULL,
	declined_date timestamp NULL,
	country text NULL,
	status text NULL,
	is_corresponding bool NULL,
	user_id text NULL,
	given_names text NULL,
	surname text NULL,
	aff text NULL,
	role_type text NULL,
	role_label text NULL,
	event_id uuid NULL
);
`
const sp_refresh_authors_as_table = `
CREATE OR REPLACE PROCEDURE public.sp_refresh_authors_as_table()
 LANGUAGE plpgsql
AS $procedure$
begin
	raise notice '% temp_authors', clock_timestamp();

	DROP TABLE IF EXISTS temp_authors;
	CREATE TEMP TABLE temp_authors AS
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
	   FROM submissions s
	     JOIN manuscript_author a ON s.event_id = a.event_id AND s.manuscript_version_id::uuid = a.manuscript_id
	     LEFT JOIN countries c ON upper(a.country) = c.iso::text;

	raise notice '% _authors', clock_timestamp();
 	TRUNCATE TABLE public._authors;
	INSERT INTO public._authors
		SELECT 
			a.id,
			a.manuscript_custom_id,
			a.email,
			a.country AS country,
			a.is_corresponding,
			a.is_submitting,
			a.user_id,
			a.given_names,
			a.surname,
			a.aff,
			a.event_id
		FROM temp_authors a;
	
	DROP TABLE IF EXISTS temp_authors;
	
	raise notice '% end', clock_timestamp();
end;
$procedure$
;
`
const sp_refresh_manuscript_editors_as_table = `
CREATE OR REPLACE PROCEDURE public.sp_refresh_manuscript_editors_as_table()
 LANGUAGE plpgsql
AS $procedure$
begin
	
	raise notice '% temp_manuscript_editors', clock_timestamp();

	DROP TABLE IF EXISTS temp_manuscript_editors; 
	CREATE TEMP TABLE temp_manuscript_editors AS
		SELECT e.id::text AS id,
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
   FROM submissions s
     JOIN manuscript_editor e ON s.event_id = e.event_id AND s.manuscript_version_id::uuid = e.manuscript_id;	    

	raise notice '% _manuscript_editors', clock_timestamp();
    
	TRUNCATE TABLE public._manuscript_editors;
	INSERT INTO public._manuscript_editors
		SELECT
		e.id, 
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
			FROM temp_manuscript_editors e;

	DROP TABLE IF EXISTS temp_manuscript_editors; 

	raise notice '% end', clock_timestamp();

end;
$procedure$
;
`
const create_authors_mv = `
CREATE MATERIALIZED VIEW public.authors
TABLESPACE pg_default
AS SELECT _authors.id,
    _authors.manuscript_custom_id,
    _authors.email,
    _authors.country,
    _authors.is_corresponding,
    _authors.is_submitting,
    _authors.user_id,
    _authors.given_names,
    _authors.surname,
    _authors.aff,
    _authors.event_id
   FROM _authors
WITH NO DATA;

-- View indexes:
CREATE INDEX a12_authors_email_idx ON public.authors USING btree (email);
CREATE INDEX a12_authors_event_id_idx ON public.authors USING btree (event_id);
CREATE INDEX a12_authors_id_idx ON public.authors USING btree (id);
CREATE INDEX a12_authors_manuscript_custom_id_idx ON public.authors USING btree (manuscript_custom_id);
CREATE INDEX a12_authors_manuscript_custom_id_is_corresponding_idx ON public.authors USING btree (manuscript_custom_id, is_corresponding);
CREATE INDEX a12_authors_manuscript_custom_id_is_submitting_idx ON public.authors USING btree (manuscript_custom_id, is_submitting);
CREATE UNIQUE INDEX a11_authors_id_country_idx ON public.authors (id,country);
`
const create_manuscript_editors_mv = `
CREATE MATERIALIZED VIEW public.manuscript_editors
TABLESPACE pg_default
AS SELECT _manuscript_editors.id,
    _manuscript_editors.manuscript_custom_id,
    _manuscript_editors.journal_name,
    _manuscript_editors.section_name,
    _manuscript_editors.special_issue_name,
    _manuscript_editors.special_issue_id,
    _manuscript_editors.email,
    _manuscript_editors.expired_date,
    _manuscript_editors.invited_date,
    _manuscript_editors.removed_date,
    _manuscript_editors.accepted_date,
    _manuscript_editors.assigned_date,
    _manuscript_editors.declined_date,
    _manuscript_editors.country,
    _manuscript_editors.status,
    _manuscript_editors.is_corresponding,
    _manuscript_editors.user_id,
    _manuscript_editors.given_names,
    _manuscript_editors.surname,
    _manuscript_editors.aff,
    _manuscript_editors.role_type,
    _manuscript_editors.role_label,
    _manuscript_editors.event_id
   FROM _manuscript_editors
WITH NO DATA;

-- View indexes:
CREATE INDEX a11_manuscript_editors_accepted_date_idx ON public.manuscript_editors USING btree (accepted_date);
CREATE INDEX a11_manuscript_editors_assigned_date_idx ON public.manuscript_editors USING btree (assigned_date);
CREATE INDEX a11_manuscript_editors_assigned_date_idx1 ON public.manuscript_editors USING btree (assigned_date);
CREATE INDEX a11_manuscript_editors_custom_id_invited_accept_idx ON public.manuscript_editors USING btree (manuscript_custom_id, invited_date DESC, accepted_date DESC);
CREATE INDEX a11_manuscript_editors_custom_id_role_type_status_idx ON public.manuscript_editors USING btree (manuscript_custom_id, role_type, status);
CREATE INDEX a11_manuscript_editors_declined_date_idx ON public.manuscript_editors USING btree (declined_date);
CREATE INDEX a11_manuscript_editors_email_idx ON public.manuscript_editors USING btree (email);
CREATE INDEX a11_manuscript_editors_event_id_idx ON public.manuscript_editors USING btree (event_id);
CREATE INDEX a11_manuscript_editors_id_idx ON public.manuscript_editors USING btree (id);
CREATE INDEX a11_manuscript_editors_invited_date_idx ON public.manuscript_editors USING btree (invited_date);
CREATE INDEX a11_manuscript_editors_manuscript_custom_id_idx ON public.manuscript_editors USING btree (manuscript_custom_id);
CREATE INDEX a11_manuscript_editors_manuscript_custom_id_invited_date_ ON public.manuscript_editors USING btree (manuscript_custom_id, invited_date);
CREATE INDEX a11_manuscript_editors_manuscript_custom_id_role_type_idx ON public.manuscript_editors USING btree (manuscript_custom_id, role_type);
CREATE INDEX a11_manuscript_editors_removed_date_idx ON public.manuscript_editors USING btree (removed_date);
CREATE INDEX a11_manuscript_editors_role_type_idx ON public.manuscript_editors USING btree (role_type);
CREATE INDEX a11_manuscript_editors_status_idx ON public.manuscript_editors USING btree (status);
CREATE INDEX a11_manuscript_editors_user_id_idx ON public.manuscript_editors USING btree (user_id);
CREATE UNIQUE INDEX a11_manuscript_editors_id_unique_idx ON public.manuscript_editors (id,manuscript_custom_id,email,status,role_type);
`
const recreate_manuscript_users_mv=`
CREATE MATERIALIZED VIEW public.manuscript_users
TABLESPACE pg_default
AS SELECT users.manuscript_custom_id,
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
           FROM authors a
        UNION
         SELECT me.manuscript_custom_id,
            me.email,
            me.given_names,
            me.surname,
            me.status,
            me.role_type
           FROM manuscript_editors me
        UNION
         SELECT mr.manuscript_custom_id,
            mr.email,
            mr.given_names,
            mr.surname,
            mr.status,
            'reviewer'::text AS role
           FROM manuscript_reviewers mr) users
     JOIN manuscripts m ON m.manuscript_custom_id = users.manuscript_custom_id
     LEFT JOIN LATERAL ( SELECT users_data.event_id,
            users_data.event_timestamp,
            users_data.email,
            users_data.unique_id,
            users_data.orcid
           FROM users_data
          WHERE users_data.email = users.email AND users_data.orcid IS NOT NULL
         LIMIT 1) user_identities ON user_identities.email = users.email
WITH NO DATA;

-- View indexes:
CREATE INDEX a11_manuscript_users_email_idx ON public.manuscript_users USING btree (email);
CREATE INDEX a11_manuscript_users_journal_name_idx ON public.manuscript_users USING btree (journal_name);
CREATE INDEX a11_manuscript_users_manuscript_custom_id_idx ON public.manuscript_users USING btree (manuscript_custom_id);
CREATE UNIQUE INDEX a11_manuscript_users_manuscript_custom_id_unique_idx ON public.manuscript_users USING btree (manuscript_custom_id, email, given_names, surname, status, role);
CREATE INDEX a11_manuscript_users_manuscript_version_id_idx ON public.manuscript_users USING btree (manuscript_version_id);
CREATE INDEX a11_manuscript_users_role_idx ON public.manuscript_users USING btree (role);
CREATE INDEX a11_manuscript_users_special_issue_custom_id_idx ON public.manuscript_users USING btree (special_issue_custom_id);
CREATE INDEX a11_manuscript_users_status_idx ON public.manuscript_users USING btree (status);
CREATE INDEX a11_manuscript_users_submission_date_idx ON public.manuscript_users USING btree (submission_date DESC);
CREATE INDEX a11_manuscript_users_submission_id_idx ON public.manuscript_users USING btree (submission_id);
CREATE INDEX a11_manuscript_users_submission_id_idx1 ON public.manuscript_users USING btree (submission_id);
`
const recreate_manuscript_reviews_mv =`
CREATE MATERIALIZED VIEW public.manuscript_reviews
TABLESPACE pg_default
AS SELECT reviews.manuscript_custom_id,
    reviews.version,
    reviews.review_id::text AS review_id,
    reviews.created_date::timestamp without time zone AS created_date,
    reviews.updated_date::timestamp without time zone AS updated_date,
    reviews.submitted_date::timestamp without time zone AS submitted_date,
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
            r.manuscript_version AS version,
            r.id AS review_id,
            r.created AS created_date,
            r.updated AS updated_date,
            r.submitted AS submitted_date,
            r.recommendation,
            r.teammemberid AS team_member_id,
            s.journal_name,
            s.section_name,
            s.special_issue_name,
            s.special_issue_id,
            s.event_id
           FROM submissions s
             JOIN manuscript_review r ON s.event_id = r.event_id) reviews
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
           FROM manuscript_editors e
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
           FROM manuscript_reviewers r
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
           FROM authors a
          WHERE a.id = reviews.team_member_id
         LIMIT 1) authors ON authors.id = reviews.team_member_id
WITH NO DATA;

-- View indexes:
CREATE INDEX a11_manuscript_reviews_created_date_idx ON public.manuscript_reviews USING btree (created_date);
CREATE INDEX a11_manuscript_reviews_custom_id_team_type_submitted_idx ON public.manuscript_reviews USING btree (manuscript_custom_id, team_type, submitted_date DESC);
CREATE INDEX a11_manuscript_reviews_manuscript_custom_id_idx ON public.manuscript_reviews USING btree (manuscript_custom_id);
CREATE INDEX a11_manuscript_reviews_manuscript_custom_id_version_idx ON public.manuscript_reviews USING btree (manuscript_custom_id, version);
CREATE INDEX a11_manuscript_reviews_recommendation_idx ON public.manuscript_reviews USING btree (recommendation);
CREATE UNIQUE INDEX a11_manuscript_reviews_review_id_idx ON public.manuscript_reviews USING btree (review_id);
CREATE INDEX a11_manuscript_reviews_submitted_date_idx ON public.manuscript_reviews USING btree (submitted_date);
CREATE INDEX a11_manuscript_reviews_team_member_email_idx ON public.manuscript_reviews USING btree (team_member_email);
CREATE INDEX a11_manuscript_reviews_team_member_email_team_type_idx ON public.manuscript_reviews USING btree (team_member_email, team_type);
CREATE INDEX a11_manuscript_reviews_team_member_id_idx ON public.manuscript_reviews USING btree (team_member_id);
CREATE INDEX a11_manuscript_reviews_team_type_idx ON public.manuscript_reviews USING btree (team_type);
CREATE INDEX a11_manuscript_reviews_updated_date_idx ON public.manuscript_reviews USING btree (updated_date);
CREATE INDEX a11_manuscript_reviews_version_idx ON public.manuscript_reviews USING btree (version);
`
const drop_updated_materialized_views = `
drop MATERIALIZED VIEW public.manuscript_reviews;

drop MATERIALIZED VIEW public.manuscript_users;

drop MATERIALIZED VIEW public.authors;

drop MATERIALIZED VIEW public.manuscript_editors;
`
const index_mvs_for_concurrent_refresh=`
DROP index if exists public.a11_invoices_data_event_id_invoice_id_idx;
CREATE UNIQUE INDEX a11_invoices_data_event_id_invoice_id_idx ON public.invoices_data USING btree (event_id, invoice_id);

DROP index if exists public.a11_journal_editorial_board_journal_id_unique_idx;
CREATE UNIQUE INDEX a11_journal_editorial_board_journal_id_unique_idx ON public.journal_editorial_board USING btree (journal_id, section_id, special_issue_id, user_id, role_type, status);

DROP index if exists public.a11_manuscript_reviewers_reviewer_id_idx;
CREATE UNIQUE INDEX a11_manuscript_reviewers_reviewer_id_idx ON public.manuscript_reviewers USING btree (reviewer_id);
`
const grant_permissions =`
ALTER TABLE IF EXISTS public._authors OWNER to postgres;
ALTER TABLE IF EXISTS public._manuscript_editors OWNER to postgres;

ALTER TABLE public.authors OWNER TO postgres;
GRANT ALL ON TABLE public.authors TO postgres;
GRANT SELECT ON TABLE public.authors TO superset_ro;

ALTER TABLE public.manuscript_editors OWNER TO postgres;
GRANT ALL ON TABLE public.manuscript_editors TO postgres;
GRANT SELECT ON TABLE public.manuscript_editors TO superset_ro;

ALTER TABLE public.manuscript_reviews OWNER TO postgres;
GRANT ALL ON TABLE public.manuscript_reviews TO postgres;
GRANT SELECT ON TABLE public.manuscript_reviews TO superset_ro;

ALTER TABLE public.manuscript_users OWNER TO postgres;
GRANT ALL ON TABLE public.manuscript_users TO postgres;
GRANT SELECT ON TABLE public.manuscript_users TO superset_ro;
`
const refresh_all_materialized_views = `
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
	refresh materialized view concurrently public.manuscript_users;
	call public.sp_log(vRefreshId, clock_timestamp(), 'manuscript_users', clock_timestamp() - vStartTime);
	commit;

	call public.sp_log(vRefreshId, clock_timestamp(), 'public.refresh_mat_views_log end', clock_timestamp() - vStartTimeProcedure);
END
$procedure$
;
`
const refresh_updated_materialized_views_for_first_time=`
refresh materialized view public.authors;
commit;
refresh materialized view public.manuscript_editors;
commit;
refresh materialized view public.manuscript_reviews;
commit;
refresh materialized view public.manuscript_users;
commit;
`

export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(create_authors_table),
	  knex.raw(create_manuscript_editors_table),

	  knex.raw(sp_refresh_authors_as_table),
	  knex.raw(sp_refresh_manuscript_editors_as_table),

	  knex.raw(drop_updated_materialized_views),

	  knex.raw(create_authors_mv),
	  knex.raw(create_manuscript_editors_mv),

	  knex.raw(recreate_manuscript_users_mv),
	  knex.raw(recreate_manuscript_reviews_mv),

	  knex.raw(index_mvs_for_concurrent_refresh),
	  
	  knex.raw(grant_permissions),
	  
	  knex.raw(refresh_updated_materialized_views_for_first_time),

	  knex.raw(refresh_all_materialized_views),
	  
	]);
  }
  
  export async function down(knex: Knex): Promise<any> {
	return Promise.all([
        //knex.raw(sp_refresh_manuscripts_as_table_migration_rollback),
      ]);
  }

  export const name = '20220529161600_fix_materialization_lock_performance_issue';
