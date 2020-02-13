-- make sure column names are identical
CREATE FOREIGN TABLE mts_no_reviewers
(
	"ManuscriptId" text,
	"FirstEditorAssign_Date" timestamp,
	"CurrentEditorAssign_Date" timestamp
)
SERVER mssql_mts
OPTIONS (
 query 'SELECT CONVERT(CHAR(7), v.editorassigndate, 120) AS Month_No
	   ,v.ManuscriptId
	   ,v.SubmitDate AS ManuscriptSubmitDate
	   ,j.FullName AS JournalName
	   ,en.FullName AS EditorName
	   ,v.EditorAssignDate
	   ,j.EditorialVendor
	   ,ean.FullName AS EA
	   ,mt.MsTypeName AS ArticleType
	   ,COALESCE(vh.Editor_Invites,1) AS Editor_Invites
	   ,DATEDIFF(DAY, v.SubmitDate, GETDATE()) AS Days_Since_Submission
	   ,COALESCE(vh.editor_assign_date, v.EditorAssignDate) AS FirstEditorAssign_Date
	   ,v.EditorAssignDate, GETDATE() AS CurrentEditorAssign_Date
from dbo.versions v
	 LEFT JOIN review r ON r.manuscriptid = v.manuscriptid 
	 INNER JOIN journals j ON j.JournalId = v.JournalId
	 INNER JOIN (SELECT sm.*
						,u.FullName
				 from dbo.StaffManuscripts sm INNER JOIN users u ON u.UserId = sm.UserId
				) ean ON ean.ManuscriptId = v.ManuscriptId
	 INNER JOIN (SELECT v2.*
						,u.FullName
				 from dbo.versions v2 INNER JOIN users u ON u.UserId = v2.EditorId
				) en ON en.ManuscriptId = v.ManuscriptId
	 INNER JOIN Manuscripts m ON m.manuscriptid = v.manuscriptid
	 INNER JOIN MsTypes mt ON mt.MsTypeId = m.MsTypeId AND mt.MsTypeId NOT IN (4,64,55,31,52)
	 LEFT JOIN (SELECT manuscriptid
						,MIN(editorassigndate) AS editor_assign_date
						,COUNT(DISTINCT EditorId) AS Editor_Invites
				 from dbo.VersionsHistory
                 WHERE YEAR(editorassigndate) >= 2019
					   AND versionnumber = 1
                 GROUP BY manuscriptid
				) vh ON vh.manuscriptid = v.manuscriptid -- find the earliest editor assign date for each manuscript
WHERE v.editorassigndate >= ''2019-01-01''
	  AND v.versionnumber = 1
	  AND v.editorassigndate IS NOT NULL
	  AND v.EditorRecommendationDate IS NULL
	  AND v.RecommendationId = ''Not''
	  AND r.manuscriptid IS NULL
ORDER BY CONVERT(CHAR(7), v.editorassigndate, 120)' 
);
