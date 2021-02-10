Feature: InvoiceNumber ValueObject

    Scenario: Generate InvoiceNumber
        Given The last generated invoice number for "2021" is "666"
        When I ask for an invoiceNumber for ID "invoice-id" on "2021-12-31"
        Then The InvoiceNumber for ID "invoice-id" should be "667"
