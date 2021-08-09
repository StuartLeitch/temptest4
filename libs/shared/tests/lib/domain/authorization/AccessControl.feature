Feature: Authorization
  Users are allowed/denied to perform some actions
  depending on the role he has

  Scenario Outline: Create Invoice (as Owner)
    Given A Transaction that I own
    When I try to create an Invoice as <Role>
    Then I should be <Action>

    Examples:
      | Role                | Action  |
      | ADMIN               | denied  |
      | SUPER_ADMIN         | allowed |
      | PAYER               | denied  |
      | QUEUE_EVENT_HANDLER | allowed |


  Scenario Outline: Create Invoice (as Tenant)
    Given A Transaction that I don't own
    And Transaction is from my Tenant
    When I try to create an Invoice as <Role>
    Then I should be <Action>

    Examples:
      | Role                | Action  |
      | ADMIN               | denied  |
      | SUPER_ADMIN         | allowed |
      | PAYER               | denied  |
      | QUEUE_EVENT_HANDLER | allowed |


  Scenario Outline: Create Invoice (as different Tenant)
    Given A Transaction that I don't own
    And Transaction is from another Tenant
    When I try to create an Invoice as <Role>
    Then I should be <Action>

    Examples:
      | Role                | Action  |
      | ADMIN               | denied  |
      | SUPER_ADMIN         | allowed |
      | PAYER               | denied  |
      | QUEUE_EVENT_HANDLER | allowed |


  Scenario Outline: Delete Invoice (as Tenant)
    Given An Invoice from my Tenant
    When I try to delete an Invoice as <Role>
    Then I should be <Action>

    Examples:
      | Role                | Action  |
      | ADMIN               | denied  |
      | SUPER_ADMIN         | allowed |
      | PAYER               | denied  |
      | QUEUE_EVENT_HANDLER | allowed |


  Scenario Outline: Delete Invoice (as different Tenant)
    Given An Invoice from another Tenant
    When I try to delete an Invoice as <Role>
    Then I should be <Action>

    Examples:
      | Role                | Action  |
      | ADMIN               | denied  |
      | SUPER_ADMIN         | allowed |
      | PAYER               | denied  |
      | QUEUE_EVENT_HANDLER | allowed |
