## Migrating MTS reports to superset database

There are 3 databases involved in the whole process:

1. MTS database - SQL Server (required read permissions for the tables).
2. Local migration postgres database. Highly reccomended to use the dockerfile provided. Check how below.
3. Superset production database - Postgres.

## Setting up local migration postgres database

### Docker container

1. Build docker image using the command:

   ```
   $ docker build . -t psql12
   ```

2. Run the image by using docker start or using `docker-compose up` in the current directory (comment out the sql part if you don't need Sql Server dev database container).

## Migration flow

All commands will be executed in the local migration postgres database.

1. Create [postgres foreign servers](https://www.postgresql.org/docs/9.4/sql-createserver.html) for superset database [createForeignServer.sql](superset-server/createForeignServer.sql) and for sql server database [createForeignServer.sql](mts-server/createForeignServer.sql).
2. Map current user (postgres in local migration postgres database - default case) to foreign servers users (see links above).
3. Create foreign tables, example:

- Note make sure destination and source tables exist on their respective databases.
- Syntax differs slightly due to wrappers having different implementation.
- Source: mts query [mtsNoReviewersReport.sql](mts-server/mtsNoReviewersReport.sql)
- Destination: superset table [mtsEditorDates.sql](superset-server/mtsEditorDates.sql)

Local migration postgres database would look like this:

```
├── tables
│   └── mts_no_reviewers                       foreign table linked to mts (SQL Server)
│   └── mts_editor_dates_with_no_reviewers     foreign table linked to superset(Postgres)
```

4. Test each table with select statement:

```sql
-- should return all rows in Postgres (0 if the destination table was just created)
SELECT * FROM mts_editor_dates_with_no_reviewers

-- should return rows in SQL Server
SELECT * FROM mts_no_reviewers
```

5. Run insert script, in our case:

```sql
INSERT INTO mts_editor_dates_with_no_reviewers -- superset
  SELECT "ManuscriptId" as manuscript_custom_id,
	"FirstEditorAssign_Date" as first_editor_assign_date,
	"CurrentEditorAssign_Date" as current_editor_assign_date
FROM mts_no_reviewers -- mts
```

Now data should be populated in both local `mts_editor_dates_with_no_reviewers` table and on the production superset database.

## Possible issues

- Queries passed into foreign table creations must be escaped

```sql
CREATE FOREIGN TABLE foreign_employees
(
  ...Columns
)
SERVER sql_server
OPTIONS (
  query 'select * from employee where name = ''Chronos''' -- notice the double single quotes
);

```

- Error `DB #: 20009, DB Msg: Unable to connect: Adaptive Server`: check again credentials passed to create foreign server. This error appears when a connection can't be established.

P.S. doamne ajuta!
