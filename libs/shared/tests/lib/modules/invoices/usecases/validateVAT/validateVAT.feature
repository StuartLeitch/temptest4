Feature: UK VAT Business rules
    @ValidateVAT
    Scenario Outline: VAT rates calculation for an APC with new Brexit rules
        Given The Payer is an <payerType> in <payerCountry>
        When  The payer will pay for an APC of <invoiceNetValue>
        Then  The invoice total amount should be <invoiceTotalValue>

        Examples:
            | payerCountry | payerType         | invoiceNetValue | invoiceTotalValue |
            | UK           | individual        | 100             | 120               |
            | UK           | institution       | 100             | 120               |
            | UK           | nonVatInstitution | 100             | 120               |
            | RO           | individual        | 200             | 200               |
            | RO           | institution       | 200             | 200               |
            | RO           | nonVatInstitution | 200             | 200               |
            | CH           | individual        | 300             | 300               |
            | CH           | institution       | 300             | 300               |
