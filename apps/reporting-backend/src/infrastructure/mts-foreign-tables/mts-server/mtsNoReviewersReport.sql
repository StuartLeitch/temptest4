-- make sure column names are identical
CREATE FOREIGN TABLE mts_no_reviewers
(
	"ManuscriptId" text,
	"FirstEditorAssign_Date" timestamp,
	"CurrentEditorAssign_Date" timestamp
)
SERVER mssql_mts
OPTIONS (
 query 'select 
	m.ManuscriptId as manuscript_custom_id, 
	r.versionnumber as version_number,
	sm.assigndate as screening_assign_date,
	v.first_editor_assign_date,
	v.current_editor_assign_date,
	r.first_reviewer_assign_date,
	r.current_reviewer_assign_date,
	r.review_return_date,
	r.Reviewers_Invited as reviewers_invited,
	r.Reviews_Pending as reviews_pending,
	r.Reviews_Completed as reviews_completed
from manuscripts m
left join InHouseScreeningManuscripts sm on m.ManuscriptId = sm.ManuscriptId
left join (select v.ManuscriptId, MIN(v.editorassigndate) as first_editor_assign_date, max(v.editorassigndate) current_editor_assign_date from Versions v group by v.ManuscriptId) v on v.ManuscriptId = m.ManuscriptId
left join (select r.ManuscriptId,  r.versionnumber,
		MIN(r.AssignDate) as first_reviewer_assign_date, 
		MAX(r.AssignDate) current_reviewer_assign_date,
		MIN(r.SubmitDate) as review_return_date,
		COUNT(DISTINCT UserId) AS Reviewers_Invited,
		SUM(CASE WHEN Status = ''Submit'' THEN 1 ELSE 0 END) AS Reviews_Completed,
		SUM(CASE WHEN Status IN (''Agreed'',''Partial'') THEN 1 ELSE 0 END) AS Reviews_Pending,
		MIN(assigndate) AS reviewer_assign_date,
		MAX(assigndate) AS Last_Assign_Date
 FROM review r
 GROUP BY manuscriptid, versionnumber
) r ON r.manuscriptid = v.manuscriptid
WHERE m.CurrentRecommendationId in (''Not'',''EdMajor'',''EdMinor'')
	and m.JournalId in (''BCA'', ''JT'', ''4242'', ''1720'', ''9403'',''APEC'',''ACE'',''AFS'',''AHCI'',''AMET'',''AM'',''AT'',''9309'',''ACISC'',''CIN'',''6471'',''7258'',''EDU'',''6816'',''IJAE'',''IJBI'',''IJCE'',''IJCGT'',''IJDMB'',''IJGP'',''IJRC'',''IJRM'',''IJTA'',''1409'',''JC'',''JCNC'',''JCSE'',''ENERGY'',''7158'',''JRE'',''JR'',''JS'',''9071'',''MSE'',''STNI'',''5192'',''2037'',''3148'',''6302'')' 
);
