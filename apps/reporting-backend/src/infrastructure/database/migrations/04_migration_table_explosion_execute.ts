import * as Knex from 'knex';

const tableExplosionExecute = `-- EXPLODING JOURNAL TABLES
call public.sp_copy_journal_all_root();
commit;

-- EXPLODING ARTICLE TABLES
call public.sp_copy_article_all();
commit;

-- EXPLODING CHECKER TABLES
call public.sp_copy_checker_all();
commit;

-- EXPLODING INVOICE TABLES
call public.sp_copy_invoice_all();
commit;

-- EXPLODING USER TABLES
call public.sp_copy_user_all();
commit;

-- EXPLODING MANUSCRIPT TABLES
call public.sp_copy_submission_manuscript_all();
commit;

call public.sp_copy_submission_manuscript_file_all();
commit;

call public.sp_copy_submission_manuscript_author_all();
commit;

call public.sp_copy_submission_manuscript_editor_all();
commit;

call public.sp_copy_submission_manuscript_reviewer_all();
commit;

call public.sp_copy_submission_manuscript_review_all();
commit;

call public.sp_copy_submission_manuscript_review_comment_all();
commit;

call public.sp_copy_submission_manuscript_review_comment_file_all();
commit;

-- DROP PROCEDURES USED FOR MIGRATION ONLY
drop procedure if exists public.sp_copy_article_all();
drop procedure if exists public.sp_copy_checker_all();
drop procedure if exists public.sp_copy_invoice_all();
drop procedure if exists public.sp_copy_journal_all();
drop procedure if exists public.sp_copy_journal_all_root();
drop procedure if exists public.sp_copy_journal_editor_all();
drop procedure if exists public.sp_copy_journal_section_all();
drop procedure if exists public.sp_copy_journal_section_editor_all();
drop procedure if exists public.sp_copy_journal_section_specialissue();
drop procedure if exists public.sp_copy_journal_section_specialissue_editor();
drop procedure if exists public.sp_copy_journal_specialissue_all();
drop procedure if exists public.sp_copy_journal_specialissue_editor();
drop procedure if exists public.sp_copy_submission_manuscript_all();
drop procedure if exists public.sp_copy_submission_manuscript_author_all();
drop procedure if exists public.sp_copy_submission_manuscript_editor_all();
drop procedure if exists public.sp_copy_submission_manuscript_file_all();
drop procedure if exists public.sp_copy_submission_manuscript_review_comment_all();
drop procedure if exists public.sp_copy_submission_manuscript_review_comment_file_all();
drop procedure if exists public.sp_copy_submission_manuscript_reviewer_all();
drop procedure if exists public.sp_copy_submission_root_all();
drop procedure if exists public.sp_copy_user_all();
`;


export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(tableExplosionExecute),
	]);
  }
  
  export async function down(knex: Knex): Promise<any> {
  }

  export const name = '04_migration_table_explosion_execute';
