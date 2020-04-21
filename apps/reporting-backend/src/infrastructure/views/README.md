# Naming conventions

- zzz_events - contains the id, timestamps, type, payloads of events
- zzz_data (ex: invoices_data) - contains fields extracted from table above
- zzz (plural, ex: invoices) - contains the information from last event, sometimes agregated from multiple views

zzz is placeholder for entity (i.e. invoices, manuscripts, etc.)

# Adding new fields to an existing view

We'll take invoice view as an example

1. Add wanted field to [InvoiceView.ts](InvoiceView.ts)

```sql
CREATE MATERIALIZED VIEW IF NOT EXISTS ${this.getViewName()}
AS SELECT
  manuscripts.submission_id as new_field,
...
```

2. If the field is from another view add dependencies if it is not already added.

```js
import manuscriptsView from './ManuscriptsView';
...
invoicesView.addDependency(manuscriptsView);
```

This will create the dependency tree which is used when refreshing views.

3. Add the sql migration in [migrationSource.ts](../database/migrationSource.ts)

```js
 private migrations: KnexMigration[] = [
  ...rest,
  rebuild_materialized_views('last_view_before_change', true),
  rebuild_materialized_views(
    'YYYY-MM-DD-HH-MM-00_add_submission_id_to_invoices_view'
  ),
]
```

4. Add the skip parameter (2nd parameter = true) to the previously last rebuild_materialized_views.
   Sometimes you add tables migrations that become dependecies to views. If you would run rebuild_materialized_views before create_journal_to_publisher_table migration, the script will break. It also skips unnecessary migrations to new databases.

# Adding a new view

1. Create the view in this directory with View.ts appended at the end
2. The view should `extends AbstractEventView implements EventViewContract`
3. Add index queries or triggers in postCreateQueries
4. Add dependencies on other views
5. Add view in [index.ts](materializedViewList.ts)
6. Create database migration (Described in point 3 from `Adding new fields to an existing view` section above)
