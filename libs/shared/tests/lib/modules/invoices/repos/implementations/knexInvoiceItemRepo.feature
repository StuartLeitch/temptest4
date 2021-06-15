Feature: Invoice Item Repo

    @ValidateKnexInvoiceItemRepo
    Scenario: Test InvoiceItem.getInvoiceItemById() method
        Given a invoice item with the id "foo-invoiceItem"
        When we call getInvoiceItemById for "foo-invoiceItem"
        Then getInvoiceItemById returns invoice item

        Given a invoice item with the id "foo-invoiceItem"
        When we call getInvoiceItemById for an un-existent invoice item "foo-invoiceItem2"
        Then getInvoiceItemById returns null

    @ValidateKnexInvoiceItemRepo
    Scenario: Test InvoiceItem.delete() method
        Given a invoice item with the id "foo-invoiceItem"
        When we call delete for the invoice item "foo-invoiceItem"
        Then delete soft deletes the invoice item "foo-invoiceItem"

    @ValidateKnexInvoiceItemRepo
    Scenario: Test InvoiceItem.update() method
        Given a invoice item with the id "foo-invoiceItem"
        When we call update for invoice item "foo-invoiceItem"
        Then update modifies the invoice item "foo-invoiceItem"

    @ValidateKnexInvoiceItemRepo
    Scenario Outline: Test InvoiceItem.exists()
        Given a invoice item with the id "foo-invoiceItem"
        When we call exists for <invoiceItem> invoice item id
        Then InvoiceItem.exists returns <exists>

        Examples:
            | invoiceItem      | exists |
            | foo-invoiceItem  | true   |
            | foo-invoiceItem2 | false  |

    @ValidateKnexInvoiceItemRepo
    Scenario: Test InvoiceItem.save()
        Given we have an invoice item object with the id "foo-invoiceItem"
        When we call InvoiceItem.save on the invoice item object
        Then the invoice item object should be saved
