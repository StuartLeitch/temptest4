Feature: Generate Compensatory Events Usecase

    @ValidateGenerateCompensatoryEvents
    Scenario Outline: Generate Compensatory Events for an Invoice marked as FINAL
        Given There is an Invoice marked as FINAL
        When I try to generate a compensatory event
        Then It should send an <EventName> Event
        And No Credit Note is created

        Examples:
            | EventName        |
            | InvoiceCreated   |
            | InvoiceConfirmed |
            | InvoicePaid      |

    @ValidateGenerateCompensatoryEvents
    Scenario: Generate Compensatory Events for an Invoice marked as DRAFT with acceptance date
        Given There is an Invoice marked as DRAFT with acceptance date
        When I try to generate a compensatory event
        Then It should send an InvoiceCreated Event
        And No Credit Note is created

    @ValidateGenerateCompensatoryEvents
    Scenario: Generate Compensatory Events for an Invoice marked as DRAFT with NO acceptance date
        Given There is an Invoice marked as DRAFT with NO acceptance date
        When I try to generate a compensatory event
        Then It should not send any event
        And No Credit Note is created

    @ValidateGenerateCompensatoryEvents
    Scenario Outline: Generate Compensatory Events for an Invoice marked as ACTIVE with acceptance date and issued date
        Given There is an Invoice marked as ACTIVE with acceptance date and issued date
        When I try to generate a compensatory event
        Then It should send an <EventName> Event
        And No Credit Note is created

        Examples:
            | EventName        |
            | InvoiceCreated   |
            | InvoiceConfirmed |

    @ValidateGenerateCompensatoryEvents
    Scenario: Generate Compensatory Events for an Invoice marked as PENDING
        Given There is an Invoice marked as PENDING
        When I try to generate a compensatory event
        Then It should send an InvoiceCreated Event
        And No Credit Note is created

    # @ValidateGenerateCompensatoryEvents
    # Scenario Outline: Generate Compensatory Events for a Credit Note
    #     Given There is a Credit Note
    #     When I try to generate a compensatory event
    #     Then It should send an <EventName> Event

    #     Examples:
    #         | EventName                |
    #         | InvoiceCreditNoteCreated |
    #         | InvoiceFinalized         |
