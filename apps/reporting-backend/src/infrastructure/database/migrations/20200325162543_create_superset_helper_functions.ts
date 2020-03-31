import * as Knex from 'knex';

export async function up(knex: Knex): Promise<any> {
  return Promise.all([
    knex.raw(formatDateBuilder('timestamp with time zone')),
    knex.raw(formatDateBuilder('timestamp without time zone')),
    knex.raw(dateSinceBuilder('timestamp with time zone')),
    knex.raw(dateSinceBuilder('timestamp without time zone')),
    knex.raw(`
CREATE OR REPLACE FUNCTION review_link(submission_id text, manuscript_version_id text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
return '<a href="https://review.hindawi.com/details/' || submission_id || '/' || manuscript_version_id || '">Review link</a>';
END;
$function$
    `),
    knex.raw(`
CREATE OR REPLACE FUNCTION screening_link(custom_id text)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
 return '<a href="https://screening.hindawi.com?customId=' || custom_id || '">Screening link</a>';
END;
$function$
    `)
  ]);
}

export async function down(knex: Knex): Promise<any> {
  return Promise.all([
    knex.raw('DROP FUNCTION format_date(timestamp with time zone)'),
    knex.raw('DROP FUNCTION format_date(timestamp without time zone)'),
    knex.raw('DROP FUNCTION days_since(timestamp with time zone)'),
    knex.raw('DROP FUNCTION days_since(timestamp without time zone)'),
    knex.raw('DROP FUNCTION screening(custom_id text)'),
    knex.raw(
      'DROP FUNCTION review_link(submission_id text, manuscript_version_id text)'
    )
  ]);
}

export const name = '20200325162543_create_superset_helper_functions.ts';

function formatDateBuilder(type: string): string {
  return `
CREATE OR REPLACE FUNCTION public.format_date(t ${type})
 RETURNS text
 LANGUAGE plpgsql
AS $function$
BEGIN
	return to_char(t, 'YYYY-MM-DD');
END;
$function$
  `;
}

function dateSinceBuilder(type: string): string {
  return `
CREATE OR REPLACE FUNCTION public.days_since(t ${type})
  RETURNS int
  LANGUAGE plpgsql
 AS $function$
 BEGIN
   return to_char(Now()::TIMESTAMP - t, 'dd')::int;
 END;
 $function$  
  `;
}
