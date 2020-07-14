Feature: Get Invoice Details Usecase

    Scenario: Get Invoice Details
        Given A invoice with the id "foo-invoice"
        When GetInvoiceDetailsUsecase is executed for invoice "foo-invoice"
        Then the details of the invoice will be returned
