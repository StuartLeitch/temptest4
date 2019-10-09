# 1. Admin edits the Transaction details
# 3. Admin edits the Invoice details
# 5. Optionally Admin saves the Invoice
# 6. Optionally Admin saves the Transaction

Feature: Operate on behalf of Payers

  Scenario: Edit Transaction Details
    Given As an Admin
    When I edit Transaction details
    Then the Transaction should be updated

  Scenario: Edit Invoice Details
    Given As an Admin
    When I edit Invoice details
    Then the Invoice should be updated
