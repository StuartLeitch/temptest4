-- make sure column names are identical

create foreign TABLE mts_editor_dates_with_no_reviewers
(
	"manuscript_custom_id" text,
	"first_editor_assign_date" timestamp,
	"current_editor_assign_date" timestamp
)
server superset
options(
	table_name 'mts_editor_dates_with_no_reviewers' -- must exist in foreign database
)