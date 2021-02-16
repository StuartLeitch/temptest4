Feature: InvoiceNumber ValueObject

    Scenario: Generate InvoiceNumber
        Given The last generated invoice number is "666"
        When I ask for an invoiceNumber for ID "invoice-id"
        Then The InvoiceNumber for ID "invoice-id" should be "667"
