Feature: Authorization

  Scenario Outline: Create Invoice (as Owner)
    Given A Transaction that I own
    When I try to create an Invoice as <Role>
    Then I should be <Action>

    Examples:
      | Role        | Action  |
      | ADMIN       | allowed |
      | SUPER_ADMIN | allowed |
      | CUSTOMER    | allowed |
      | PAYER       | denied  |
      | AUTHOR      | allowed |


# Scenario Outline: Create Invoice (as Tenant)
#   Given A Transaction that I don't own
#   And Transaction is from my Tenant
#   When I try to create an Invoice as <Role>
#   Then I should be <Action>

#   Examples:
#     | Role        | Action  |
#     | ADMIN       | allowed |
#     | SUPER_ADMIN | allowed |
#     | CUSTOMER    | denied  |
#     | PAYER       | denied  |
#     | AUTHOR      | denied  |


# Scenario Outline: Create Invoice (as different Tenant)
#   Given A Transaction that I don't own
#   And Transaction is from another Tenant
#   When I try to create an Invoice as <Role>
#   Then I should be <Action>

#   Examples:
#     | Role        | Action  |
#     | ADMIN       | denied  |
#     | SUPER_ADMIN | allowed |
#     | CUSTOMER    | denied  |
#     | PAYER       | denied  |
#     | AUTHOR      | denied  |


# Scenario Outline: Delete Invoice (as Tenant)
#   Given An Invoice from my Tenant
#   When I try to delete an Invoice as <Role>
#   Then I should be <Action>

#   Examples:
#     | Role        | Action  |
#     | ADMIN       | allowed |
#     | SUPER_ADMIN | allowed |
#     | CUSTOMER    | denied  |
#     | PAYER       | denied  |
#     | AUTHOR      | denied  |


# Scenario Outline: Delete Invoice (as different Tenant)
#   Given An Invoice from my Tenant
#   When I try to delete an Invoice as <Role>
#   Then I should be <Action>

#   Examples:
#     | Role        | Action  |
#     | ADMIN       | denied  |
#     | SUPER_ADMIN | allowed |
#     | CUSTOMER    | denied  |
#     | PAYER       | denied  |
#     | AUTHOR      | denied  |
