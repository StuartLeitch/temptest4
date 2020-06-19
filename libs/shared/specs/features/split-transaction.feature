# Feature: Split Transaction

#   Scenario: Adjust two ways split transaction
#     Given As System editing Transaction Details
#     When Transaction value is 100
#     And I add a new Payer
#     Then the new draft Invoice value should be 100
#     When I add a new Payer
#     Then Another new draft Invoice should be created
#     And Both invoices should have value of 50

#   Scenario: Adjust three ways split transaction
#     Given As System editing Transaction Details
#     When Transaction value is 6
#     And I add a new Payer
#     Then the new draft Invoice value should be 6
#     When I add two Payers
#     Then Another two draft Invoice should be created
#     And All invoices should have value of 2

#   Scenario: Adjust two ways split transaction when payer is removed
#     Given As System editing Transaction Details
#     When Transaction value is 60
#     And I add three new Payers
#     Then All invoices should have value of 20
#     When I remove one Payer
#     Then Transaction should only have 2 invoices
#     And Both invoices should have value of 30
