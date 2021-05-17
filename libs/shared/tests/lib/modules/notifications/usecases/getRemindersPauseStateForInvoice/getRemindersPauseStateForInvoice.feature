Feature: getRemindersPauseStateForInvoiceUsecase test

    @ValidateGetRemindersPauseState
    Scenario: Fetch reminders for a certain invoice
        Given invoice with "reminders-invoice" id
        And the paused state reminders for invoice "reminders-invoice"
        When I try to fetch paused reminders for invoice "reminders-invoice"
        Then I should receive reminders

    @ValidateGetRemindersPauseState
    Scenario: Calling the usecase for an invoice without reminder state
         Given invoice with "nostate-invoice" id
         When I try to fetch paused reminders for invoice "nostate-invoice"
         Then I should obtain an error that the pause state does not exist