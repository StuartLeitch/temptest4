Feature: Transaction Repo

    @ValidateKnexTransactionRepo
    Scenario: Test Transaction.getTransactionById() method
        Given a transaction with the id "foo-transaction"
        When we call getTransactionById for "foo-transaction"
        Then getTransactionById returns transaction

        Given a transaction with the id "foo-transaction"
        When we call getTransactionById for an un-existent transaction "foo-transaction2"
        Then getTransactionById returns null

    @ValidateKnexTransactionRepo
    Scenario: Test Transaction.delete() method
        Given a transaction with the id "foo-transaction"
        When we call delete for the transaction "foo-transaction"
        Then delete soft deletes the transaction "foo-transaction"

    @ValidateKnexTransactionRepo
    Scenario Outline: Test Transaction.exists()
        Given a transaction with the id "foo-transaction"
        When we call exists for <transaction> transaction id
        Then Transaction.exists returns <exists>

        Examples:
            | transaction      | exists |
            | foo-transaction  | true   |
            | foo-transaction2 | false  |

    @ValidateKnexTransactionRepo
    Scenario: Test Transaction.save()
        Given we have an transaction object with the id "foo-transaction"
        When we call Transaction.save on the transaction object
        Then the transaction object should be saved
