Feature: Create Credit Note Usecase

    @ValidateCreateCreditNote
    Scenario: Create a Credit Note for a valid Invoice ID
        Given There is an ACTIVE Invoice with an existing id "invoice-id"
        When I try to create a Credit Note for the invoice with id "invoice-id"
        Then The original Invoice is marked as final
        And A new Invoice is generated with a reference to the original Invoice ID "invoice-id"
        And The new Invoice is marked as final
