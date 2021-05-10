Feature: Paused Reminder Repo

    Scenario: Test PausedReminderRepo.getNotificationPausedStatus
        Given an invoice with id "test-invoice" and a paused notification item
        When we call getNotificationPausedStatus for "test-invoice"
        Then getNotificationPausedStatus returns the NotificationPause item

    Scenario: Test PausedReminderRepo.insertBasePause
        Given an invoice with id "test-invoice" and a paused notification item
        When we call insertBasePause for "new-test-invoice"
        Then insertBasePause should save the new paused reminder
