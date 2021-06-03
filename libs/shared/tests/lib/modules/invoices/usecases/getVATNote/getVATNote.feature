Feature: Get VAT Note
    @ValidateVATNote
    Scenario Outline: VAT notes calculation for an APC with new Brexit rules
        Given The Payer is in <payerCountry>
        When  The VAT note is generated
        Then  The VAT note should be <vatNote>

        Examples:
            | payerCountry | vatNote |
            | UK           | UK VAT applies to this invoice. (VAT amount in GBP is {Vat/Rate} GBP, 1 GBP = {Rate} USD) |
            | RO           | |
            | CH           | |