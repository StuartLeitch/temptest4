Feature: Save Events UseCase

    @ValidateSaveEvents
    Scenario: UseCase Mapping
        Given There is a list of events: "SubmissionSubmitted", "JournalAdded", "InvoicePaid", "UserAdded", "RandomDump", "RandomDump2"
        When I try to save the events
        Then The events are saved and correctly mapped
