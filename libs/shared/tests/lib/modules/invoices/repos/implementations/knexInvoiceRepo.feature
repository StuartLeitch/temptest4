Feature: Invoice  Repo

    Scenario: Test Invoice.getInvoiceById() method
        Given a invoice with the id "foo-invoice" and transaction id "foo-transaction"
        When we call getInvoiceById for "foo-invoice"
        Then getInvoiceById returns the invoice

        Given a invoice with the id "foo-invoice" and transaction id "foo-transaction"
        When we call getInvoiceById for an un-existent invoice "foo-invoice2"
        Then getInvoiceById returns null

    Scenario: Test Invoice.getInvoiceByTransactionId() method
        Given a invoice with the id "foo-invoice" and transaction id "foo-transaction"
        And a invoice with the id "foo-invoice1" and transaction id "foo-transaction"
        When we call getInvoiceByTransactionId for "foo-transaction"
        Then getInvoiceByTransactionId returns the 2 invoices
        When we call getInvoiceByTransactionId for "foo-transaction1"
        Then getInvoiceByTransactionId returns null

    Scenario: Test Invoice.delete() method
        Given a invoice with the id "foo-invoice" and transaction id "foo-transaction"
        When we call delete for the invoice "foo-invoice"
        Then delete soft deletes the invoice "foo-invoice"

    Scenario: Test Invoice.update() method
        Given a invoice with the id "foo-invoice" and transaction id "foo-transaction"
        When we call update for invoice "foo-invoice"
        Then update modifies the invoice "foo-invoice"

    Scenario Outline: Test Invoice.exists()
        Given a invoice with the id "foo-invoice" and transaction id "foo-transaction"
        When we call exists for <invoice> invoice id
        Then Invoice.exists returns <exists>

        Examples:
            | invoice      | exists |
            | foo-invoice  | true   |
            | foo-invoice2 | false  |

    Scenario: Test Invoice.save()
        Given we have an invoice object with the id "foo-invoice"
        When we call Invoice.save on the invoice object
        Then the invoice object should be saved

    Scenario: Test Invoice.assignInvoiceNumber()
        Given a invoice with the id "foo-invoice" and transaction id "foo-transaction"
        When we call Invoice.assignInvoiceNumber on the invoice "foo-invoice"
        Then the invoice number of "foo-invoice" should be 1

        Given a invoice with the id "foo-invoice1" and transaction id "foo-transaction"
        When we call Invoice.assignInvoiceNumber on the invoice "foo-invoice1"
        Then the invoice number of "foo-invoice1" should be 2
