Feature: Credit Note Repo

    Background:
        Given a credit note with invoiceId "test-invoice" and id "test-creditNote"

    @ValidateKnexCreditNoteRepo
    Scenario: Test CreditNote.getCreditNoteByInvoiceId() method
        When we call getCreditNoteByInvoiceId for "test-invoice"
        Then getCreditNoteByInvoiceId returns the credit note

        When we call getCreditNoteByInvoiceId for un-existent credit note "test-invoice2"
        Then getCreditNoteByInvoiceId returns null

    @ValidateKnexCreditNoteRepo
    Scenario: Test CreditNote.getCreditNoteById() method
        When we call getCreditNoteById for "test-creditNote"
        Then getCreditNoteById returns the credit note

        When we call getCreditNoteById for un-existent credit note "test-creditNote2"
        Then getCreditNoteById returns not found

    @ValidateKnexCreditNoteRepo
    Scenario: Test CreditNote.update() method
        When we call update for credit note "test-creditNote"
        Then update modifies the credit note "test-creditNote"

    @ValidateKnexCreditNoteRepo
    Scenario Outline: Test CreditNote.exists() method
        When we call exists for <creditNote> credit note id
        Then CreditNote.exists returns <exists>

        Examples:
            | creditNote       | exists |
            | test-creditNote  | true   |
            | test-creditNote2 | false  |

    @ValidateKnexCreditNoteRepo
    Scenario: Test CreditNote.save()
        Given a credit note object with id "test-creditNote"
        When we call CreditNote.save on the credit note object
        Then the credit note object should be saved
