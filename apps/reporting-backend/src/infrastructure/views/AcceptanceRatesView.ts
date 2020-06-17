import {
  AbstractEventView,
  EventViewContract,
} from './contracts/EventViewContract';

/**
 * AcceptanceRatesView is a table, unlike most views. It shouldn't be exported in the dependecy sorted array.
 */
class AcceptanceRatesView extends AbstractEventView
  implements EventViewContract {
  public getCreateQuery(): string {
    return `
CREATE TABLE ${this.getViewName()} (
  journal_id text,
  month date,
  journal_rate numeric,
  paid_regular_rate numeric,
  paid_special_issue_rate numeric,
  free_rate numeric
)`;
  }

  postCreateQueries = [
    `create index on ${this.getViewName()} (journal_id)`,
    `create index on ${this.getViewName()} (month)`,
    `create index on ${this.getViewName()} (journal_id, month)`,
    // add index in migration, not here
  ];

  public getSelectQuery(): string {
    const startDate = `2019-01-01`;
    return `
SELECT
  j.journal_id,
  j.month,
  journal_rates.avg as journal_rate,
  paid_regular_rates.avg as paid_regular_rate,
  paid_special_rates.avg as paid_special_issue_rate,
  free_rates.avg as free_rate
FROM ( SELECT DISTINCT
    journal_id,
    generate_series(date_trunc('month', '${startDate}'::date), now(), '1 month')::date AS month
  FROM
    manuscripts) j
LEFT JOIN LATERAL (
  SELECT
    journal_id,
    ${this.getAvgSelect()}
  FROM
    manuscripts m
  WHERE
    ${this.getDateFilter()}
  GROUP BY
    journal_id) journal_rates ON journal_rates.journal_id = j.journal_id
LEFT JOIN LATERAL (
  SELECT
    journal_id,
    ${this.getAvgSelect()}
  FROM
    manuscripts m
  WHERE
    ${this.getDateFilter()}
    AND m.issue_type = 'regular'
    AND m.apc = 'paid'
  GROUP BY
    journal_id) paid_regular_rates ON paid_regular_rates.journal_id = j.journal_id
LEFT JOIN LATERAL (
  SELECT
    journal_id,
    ${this.getAvgSelect()}
  FROM
    manuscripts m
  WHERE
    ${this.getDateFilter()}
    AND m.issue_type = 'special'
    AND m.apc = 'paid'
  GROUP BY
    journal_id) paid_special_rates ON paid_special_rates.journal_id = j.journal_id
LEFT JOIN LATERAL (
  SELECT
    journal_id,
    ${this.getAvgSelect()}
  FROM
    manuscripts m
  WHERE
    ${this.getDateFilter()}
    AND m.apc = 'free'
  GROUP BY
    journal_id) free_rates ON free_rates.journal_id = j.journal_id
`;
  }

  getRefreshQuery() {
    return `
BEGIN;
DELETE FROM ${this.getViewName()};
INSERT INTO ${this.getViewName()} ${this.getSelectQuery()};
COMMIT;    
`;
  }

  public getDeleteQuery(): string {
    return `drop table ${acceptanceRatesView.getViewName()} cascade`;
  }

  public getViewName(): string {
    return 'acceptance_rates';
  }

  private getAvgSelect(identifier = 'avg') {
    return `avg(
      CASE WHEN m.accepted_date IS NOT NULL THEN
        1
      WHEN m.final_decision_date IS NOT NULL THEN
        0
      ELSE
        0.5
      END) as ${identifier}`;
  }

  private getDateFilter(argDate = 'month') {
    return `submission_date > ${argDate} - interval '16 month' AND submission_date < ${argDate} - interval '8 month'`;
  }
}

const acceptanceRatesView = new AcceptanceRatesView();

export default acceptanceRatesView;
