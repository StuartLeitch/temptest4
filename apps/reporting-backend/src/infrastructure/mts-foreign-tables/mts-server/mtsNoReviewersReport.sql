-- make sure column names are identical
CREATE FOREIGN TABLE mts_manuscript_details
(
	editor_assign_date timestamp,
	manuscript_custom_id text,
	manuscript_submission_date timestamp,
	article_type text,
	version_number int,
	version_submit_date timestamp,
	recommendation text,
	journal_name text,
	editor_name text,
	editorial_vendor text,
	editorial_assistant text,
	screening_assign_date timestamp,
	screening_left_date timestamp,
	editor_invites int,
	reviewers_invited int,
	reviews_pending int,
	reviews_completed int,
	first_editor_assign_date timestamp,
	current_editor_assign_date timestamp,
	first_reviewer_assign_date timestamp,
	last_reviewer_assign_date timestamp,
	first_review_submitted_date timestamp
)
SERVER mssql_mts
OPTIONS (
 query 'SELECT v.editorassigndate editor_assign_date
	   ,m.ManuscriptId as manuscript_custom_id
	   ,m.MSSubmitDate as manuscript_submission_date
	   ,mt.MsTypeName AS article_type
	   ,v.VersionNumber as version_number
	   ,v.SubmitDate AS version_submit_date
	   ,v.RecommendationId as recommendation
	   ,j.FullName AS journal_name
	   ,en.FullName AS editor_name
	   ,j.EditorialVendor as editorial_vendor
	   ,ean.FullName AS editorial_assistant
	   ,ism.AssignDate AS screening_assign_date
	   ,ism.UnassignDate AS screening_left_date
	   ,COALESCE(vh.EditorInvites,1) AS editor_invites
	   ,r.Reviewers_Invited as reviewers_invited
	   ,r.Reviews_Pending as reviews_pending
	   ,r.Reviews_Completed as reviews_completed
	   ,COALESCE(vh.EditorAssignDate, v.EditorAssignDate) AS first_editor_assign_date
	   ,v.EditorAssignDate AS current_editor_assign_date
	   ,r.Last_Assign_Date AS first_reviewer_assign_date
	   ,r.Last_Assign_Date AS last_reviewer_assign_date
	   ,r.review_return_date AS first_review_submitted_date
FROM Manuscripts m
	 INNER JOIN Versions v ON m.manuscriptid = v.manuscriptid
	 LEFT JOIN InHouseScreeningManuscripts ism ON ism.ManuscriptId = m.ManuscriptId
	 LEFT JOIN (SELECT manuscriptid
						,versionnumber
						,COUNT(DISTINCT UserId) AS Reviewers_Invited
						,SUM(CASE WHEN Status = ''Submit'' THEN 1 ELSE 0 END) AS Reviews_Completed
						,SUM(CASE WHEN Status IN (''Agreed'',''Partial'') THEN 1 ELSE 0 END) AS Reviews_Pending
						,MIN(SubmitDate) AS review_return_date
						,MIN(assigndate) AS reviewer_assign_date
						,MAX(assigndate) AS Last_Assign_Date
				 FROM review
                 WHERE assigndate >= ''2018-01-01''
                 GROUP BY manuscriptid, versionnumber
				) r ON r.manuscriptid = v.ManuscriptId AND r.VersionNumber = v.VersionNumber
	 LEFT JOIN (SELECT manuscriptid
					   ,versionnumber
					   ,MIN(editorassigndate) AS EditorAssignDate
					   ,COUNT(DISTINCT EditorId) AS EditorInvites
				 FROM VersionsHistory
                 WHERE YEAR(editorassigndate) >= 2018
                 GROUP BY manuscriptid, versionnumber
				) vh ON vh.manuscriptid = v.manuscriptid AND vh.VersionNumber = v.VersionNumber
	 INNER JOIN MsTypes mt ON mt.MsTypeId = m.MsTypeId AND mt.MsTypeId NOT IN (4,64,55,31,52)
	 INNER JOIN Journals j ON j.JournalId = m.JournalId
	 INNER JOIN (SELECT sma.ManuscriptId,u.FullName,u.Email
				 FROM StaffManuscripts sma INNER JOIN users u ON u.UserId = sma.UserId
				) ean ON ean.ManuscriptId = m.ManuscriptId
	 INNER JOIN Users en ON en.UserId = m.CurrentEditorId
WHERE YEAR(m.MSSubmitDate) >= 2019
ORDER BY m.manuscriptid');