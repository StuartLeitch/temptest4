Feature: Transaction Domain Entity

    @ValidateTransaction
    Scenario: Create Transaction
        Given There is a Transaction Domain Entity
        When The Transaction.create method is called
        Then A new DRAFT Transaction is successfully created

    @ValidateTransaction
    Scenario: Add Invoice to Transaction
        Given There is a Transaction Domain Entity
        When I try to add an Invoice with ID = "invoice-id" to that Transaction
        Then The Invoice with id "invoice-id" is successfully added to the Transaction

    @ValidateTransaction
    Scenario Outline: Change Transaction Status
        Given There is a Transaction Domain Entity
        When I try to change the Transaction status to <Status>
        Then The Transaction status is changed to <Status>

        Examples:
            | Status |
            | ACTIVE |
            | FINAL  |
