import * as Knex from 'knex';
import JournalEditorialBoardView from '../../views/JournalEditorialBoardView';
import JournalSectionsView from '../../views/JournalSectionsView';
import JournalSpecialIssuesDataView from '../../views/JournalSpecialIssuesDataView';
import JournalSpecialIssuesView from '../../views/JournalSpecialIssuesView';
import JournalsView from '../../views/JournalsView';

const create_journal_apc_table = `
CREATE TABLE public.journal_apc (
	event_id uuid NULL,
	event_time timestamptz NULL,
	event_type varchar(255) NULL,
	id uuid NULL,
	apc text NULL,
	created text NULL,
	updated text NULL
);
`

const insert_into_journal_tables = `
CREATE OR REPLACE FUNCTION public.insert_into_journal_tables()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
declare
begin

	if ((new.type in ('JournalAdded', 'JournalUpdated') and new.time <'2022-03-31 13:44:00.971 +0200') 
	or new.type in ('JournalAPCUpdated')) then
	insert into public.journal_apc
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as id,
			NEW.payload ->>'apc' as apc,
			NEW.payload ->>'created' as created,
			NEW.payload ->>'updated' as updated 
			;	
	end if;

	--Skip remaining journal tables for short events!
	if new.type in ('JournalAPCUpdated') then
		RETURN NEW;	
	end if;

	--create table public._journal as select * from public.journal limit 0;
	insert into public.journal
		select
			NEW.Id as event_id,
			NEW.time as event_time,
			NEW.type as event_type,
			uuid(NEW.payload ->>'id') as id,
			NEW.payload ->>'apc' as apc,
			NEW.payload ->>'code' as code,
			NEW.payload ->>'issn' as issn,
			NEW.payload ->>'name' as name,
			NEW.payload ->>'email' as email,
			NEW.payload ->>'created' as created,
			NEW.payload ->>'updated' as updated,
			NEW.payload ->>'isActive' as isActive,
			NEW.payload ->>'publisherName' as publisherName,
			NEW.payload ->>'activationDate' as activationDate,
			NEW.payload ->'peerReviewModel' ->> 'name' peerReviewModelName
			,NEW.payload ->'editors' as editors_json -- todo: dowe still need jsons
			,NEW.payload ->'sections' sections_json
			,NEW.payload ->'articleTypes' articleTypes
			,NEW.payload ->'specialIssues' as specialIssues_json 
			;
	
	--create table public._journal_editor as select * from public.journal_editor limit 0;
	insert into public.journal_editor
	select
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,

		uuid(editors.value ->> 'id') as id,
		editors.value ->> 'aff' as aff,
		editors.value -> 'role' ->> 'type'  as roleType,
		editors.value -> 'role' ->> 'label' as roleLabel,
		editors.value ->> 'email' as email,
		editors.value ->> 'title' as title,
		editors.value ->> 'status' as status,
		editors.value ->> 'userId' as userId,
		editors.value ->> 'country' as country,
		editors.value ->> 'orcidId' as orcidId,
		editors.value ->> 'surname' as surname,
		editors.value ->> 'givenNames' as givenNames,
		editors.value ->> 'expiredDate' expiredDate,
		editors.value ->> 'invitedDate' invitedDate,
		editors.value ->> 'removedDate' removedDate,
		editors.value ->> 'acceptedDate' acceptedDate,
		editors.value ->> 'assignedDate' assignedDate,
		editors.value ->> 'declinedDate' declinedDate,
		editors.value ->> 'isCorresponding' as isCorresponding
	from 
		jsonb_array_elements(NEW.payload ->'editors') editors;
	
	--create table public._journal_section as select * from public.journal_section limit 0;
	INSERT INTO public.journal_section 
	SELECT
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		NEW.payload ->>'name' as journal_name,
		NEW.payload ->>'issn' as journal_issn,
		NEW.payload ->>'code' as journal_code,
		
		uuid(sections.value ->> 'id') as id,
		sections.value ->> 'name' as name,
		sections.value ->> 'created' as created,
		sections.value ->> 'updated' as updated,
		sections.value ->'editors' as editors_json,
		sections.value ->'specialIssues' as specialIssues_json
	FROM
		jsonb_array_elements(NEW.payload ->'sections') sections;

	--create table public._journal_section_editor as select * from public.journal_section_editor limit 0;
	INSERT INTO public.journal_section_editor 
	SELECT
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		uuid(js.value ->> 'id') as journal_section_id,

		uuid(jse.value ->> 'id') as id,
		jse.value ->> 'aff' as aff,
		jse.value -> 'role' ->> 'type'  as roleType,
		jse.value -> 'role' ->> 'label' as roleLabel,
		jse.value ->> 'email' as email,
		jse.value ->> 'title' as title,
		jse.value ->> 'status' as status,
		jse.value ->> 'userId' as userId,
		jse.value ->> 'country' as country,
		jse.value ->> 'orcidId' as orcidId,
		jse.value ->> 'surname' as surname,
		jse.value ->> 'givenNames' as givenNames,
		jse.value ->> 'expiredDate' expiredDate,
		jse.value ->> 'invitedDate' invitedDate,
		jse.value ->> 'removedDate' removedDate,
		jse.value ->> 'acceptedDate' acceptedDate,
		jse.value ->> 'assignedDate' assignedDate,
		jse.value ->> 'declinedDate' declinedDate,
		jse.value ->> 'isCorresponding' as isCorresponding
	from
		jsonb_array_elements(NEW.payload ->'sections') js,
		jsonb_array_elements(js -> 'editors') jse;

	--create table public._journal_section_specialissue as select * from public.journal_section_specialissue limit 0;
	INSERT INTO public.journal_section_specialissue
	SELECT
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		uuid(js.value ->> 'id') as journal_section_id,

		uuid(jssi.value ->> 'id') as id,
		jssi.value ->> 'name' as name,
		jssi.value ->> 'created' as created,
		jssi.value ->> 'endDate' as endDate,
		jssi.value ->> 'updated' as updated,
		jssi.value ->> 'customId' as customId,
		jssi.value ->> 'isActive' as isActive,
		jssi.value ->> 'startDate' as startDate,
		jssi.value ->> 'isCancelled' as isCancelled,
		jssi.value ->> 'cancelReason' as cancelReason,
		jssi.value ->> 'callForPapers' as callForPapers,
		jssi.value -> 'peerReviewModel' ->> 'name' as peerReviewModelName,
		jssi.value -> 'editors' as editors_json
	from
		jsonb_array_elements(NEW.payload ->'sections') js,
		jsonb_array_elements(js -> 'specialIssues') jssi;

	--create table public._journal_section_specialissue_editor as select * from public.journal_section_specialissue_editor limit 0;
	INSERT INTO public.journal_section_specialissue_editor
	SELECT
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		uuid(js.value ->> 'id') as journal_section_id,
		uuid(jssi.value ->>'id') as journal_section_specialissue_id,

		uuid(jssie.value ->> 'id') as id,
		jssie.value ->> 'aff' as aff,
		jssie.value -> 'role' ->> 'type'  as roleType,
		jssie.value -> 'role' ->> 'label' as roleLabel,
		jssie.value ->> 'email' as email,
		jssie.value ->> 'title' as title,
		jssie.value ->> 'status' as status,
		jssie.value ->> 'userId' as userId,
		jssie.value ->> 'country' as country,
		jssie.value ->> 'orcidId' as orcidId,
		jssie.value ->> 'surname' as surname,
		jssie.value ->> 'givenNames' as givenNames,
		jssie.value ->> 'expiredDate' expiredDate,
		jssie.value ->> 'invitedDate' invitedDate,
		jssie.value ->> 'removedDate' removedDate,
		jssie.value ->> 'acceptedDate' acceptedDate,
		jssie.value ->> 'assignedDate' assignedDate,
		jssie.value ->> 'declinedDate' declinedDate,
		jssie.value ->> 'isCorresponding' as isCorresponding
	from
		jsonb_array_elements(NEW.payload ->'sections') js,
		jsonb_array_elements(js -> 'specialIssues') jssi,
		jsonb_array_elements(jssi -> 'editors') jssie;

	--create table public._journal_specialissue as select * from public.journal_specialissue limit 0;
	INSERT INTO public.journal_specialissue 
	select
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,

		uuid(si.value ->> 'id') as id,
		si.value ->> 'name' as name,
		si.value ->> 'created' as created,
		si.value ->> 'endDate' as endDate,
		si.value ->> 'updated' as updated,
		si.value ->> 'customId' as customId,
		si.value ->> 'isActive' as isActive,
		si.value ->> 'startDate' as startDate,
		si.value ->> 'isCancelled' as isCancelled,
		si.value ->> 'cancelReason' as cancelReason,
		si.value ->> 'callForPapers' as callForPapers,
		si.value -> 'peerReviewModel' ->> 'name' as peerReviewModelName,
		si.value -> 'editors' as editors_json
	from 
		jsonb_array_elements(NEW.payload ->'specialIssues') si;

	--create table public._journal_specialissue_editor as select * from public.journal_specialissue_editor limit 0;
	INSERT INTO public.journal_specialissue_editor
	select 
		NEW.Id as event_id,
		NEW.time as event_time,
		NEW.type as event_type,
		uuid(NEW.payload ->>'id') as journal_id,
		uuid(jsi.value ->> 'id') as journal_specialissue_id,

		uuid(jsie.value ->> 'id') as id,
		jsie.value ->> 'aff' as aff,
		jsie.value -> 'role' ->> 'type'  as roleType,
		jsie.value -> 'role' ->> 'label' as roleLabel,
		jsie.value ->> 'email' as email,
		jsie.value ->> 'title' as title,
		jsie.value ->> 'status' as status,
		jsie.value ->> 'userId' as userId,
		jsie.value ->> 'country' as country,
		jsie.value ->> 'orcidId' as orcidId,
		jsie.value ->> 'surname' as surname,
		jsie.value ->> 'givenNames' as givenNames,
		jsie.value ->> 'expiredDate' expiredDate,
		jsie.value ->> 'invitedDate' invitedDate,
		jsie.value ->> 'removedDate' removedDate,
		jsie.value ->> 'acceptedDate' acceptedDate,
		jsie.value ->> 'assignedDate' assignedDate,
		jsie.value ->> 'declinedDate' declinedDate,
		jsie.value ->> 'isCorresponding' as isCorresponding
	from
		jsonb_array_elements(NEW.payload ->'specialIssues') jsi,
		jsonb_array_elements(jsi -> 'editors') jsie;

	RETURN NEW;
	END
$function$
;
`

const process_journal_apc_old_events = `
	insert into public.journal_apc
		select event_id, event_date, "event", journal_id::uuid, apc, event_date, updated_date 
		from journals_data jd where event_date <'2022-03-31 13:44:00.971 +0200' and event in ('JournalAdded', 'JournalUpdated');
	commit;
`

const process_journal_apc_dump_events = `
begin transaction;
do $$declare event_id uuid;
begin
	while exists(select * from dump_events de where "type" ='JournalAPCUpdated' limit 1) loop
		select id into event_id  from dump_events de where "type" ='JournalAPCUpdated' limit 1;
		insert into journal_events select * from dump_events de where id=event_id;
		delete from dump_events de where id=event_id;
		raise notice '%', event_id;
	end loop;
end$$;

commit;
`


export async function up(knex: Knex): Promise<any> {
	return Promise.all([
	  knex.raw(create_journal_apc_table),
	  knex.raw(process_journal_apc_old_events),
	  knex.raw(insert_into_journal_tables),
	  knex.raw(process_journal_apc_dump_events),
	]);
  }
  
  export async function down(knex: Knex): Promise<any> {
	return Promise.all([
        //knex.raw(sp_refresh_manuscripts_as_table_migration_rollback),
      ]);
  }

  export const updatedMaterializedViews = 
	[
		JournalsView,
		JournalEditorialBoardView,
		JournalSectionsView,
		JournalSpecialIssuesDataView,
		JournalSpecialIssuesView,
	];
  
  export const name = '20220803124000_fix_missing_journal_apc';
