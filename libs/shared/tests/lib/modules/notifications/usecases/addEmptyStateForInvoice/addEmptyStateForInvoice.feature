Feature: Add Empty Reminder State for Invoice use case

    Scenario: Add empty pause reminder for an invoice reminder
        Given an invoice with the id "test-invoice"
        When I try to insert a new empty pause reminder with invoice id "test-invoice"
        Then the empty pause reminder for invoice "test-invoice" should be added

    Scenario: Reminder not added for unknown invoice
        Given an invoice with the id "test-invoice"
         When I try to insert a new empty pause reminder with invoice id "test-2"
         Then I should receive an error