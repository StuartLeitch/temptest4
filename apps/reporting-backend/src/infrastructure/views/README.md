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

# Allowing RBAC through superset

Vendor views (note: non-materialized) are used to control access to charts/dashboards in superset.
Ex: manuscript_vendors are used to restrict vendors to only in progress manuscripts. If you create a chart with the datasource `manuscripts` vendors `will not` be able see it. If you create a chart with the datasource `manuscript_vendors`, vendors `will` be able to see it.

The view `manuscript_vendors_full_access` will only be used for filter charts (you should be able to filter by a manuscript type that has no entries in progress for a certain value).

# Solving circular dependecies

Making a materialized view depend on another will cause a runtime exception. This can be avoid by using tables and controlling the refresh flow manually.

## Acceptance rates

In order to calculate acceptance rates we need to use the manuscripts view. Later in the development of the acceptance rates feature we will add a forecasted revenue field to manuscripts view (net_apc * journal_acceptance_rate_of_submission_month). The order of refreshing should be:

`manuscripts -> acceptance_rates (TODO need to implement table refresh cron) -> manuscripts`

