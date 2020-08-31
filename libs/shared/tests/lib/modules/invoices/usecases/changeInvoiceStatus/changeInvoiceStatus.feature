Feature: Change Invoice Status

    Scenario Outline: Change Invoice Status for and existing ID
        Given There is an Invoice with an existing ID "invoice-id"
        When I try update the status for the Invoice with ID "invoice-id" to <Status>
        Then The Invoice with ID "invoice-id" is successfully updated to <Status>

        Examples:
            | Status  |
            | PENDING |
            | ACTIVE  |
            | FINAL   |

    Scenario: Change Invoice Status for a non-existing ID
        Given There is an Invoice with a non-existing ID "unknown-id"
        When I try update the status for the Invoice with ID "unknown-id" to ACTIVE
        Then An InvoiceNotFoundError error is returned
