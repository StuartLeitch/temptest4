# Feature: On Manuscript Submit

#   Scenario: Manuscript Submit Handler
#     Given Invoicing listening to events emitted by Review
#     When A manuscript submit event is published
#     Then A DRAFT Transaction should be created
#     And A DRAFT Invoice should be created
#     And An Invoice Item should be created
#     And The Invoice Item should have a price attached
