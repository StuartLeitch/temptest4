Feature: Payment tests
#   Background:
#     Given There is a Journal "foo-journal" with APC "200"

    
    Scenario: Partial Bank Transfer payment is applied
        When 1 "non-final" Bank Transfer payment with the amount 500 is applied
        Then The payment amount is 500
    
    Scenario: Partial Bank Transfer payment is applied
        When 1 "non-final" Bank Transfer payment with the amount 500 is applied
        Then The payments are of type "Bank Transfer"
    
    Scenario: 2 Partial Bank Transfer payment is applied
        When 1 "non-final" Bank Transfer payment with the amount 500 is applied
        When 1 "final" Bank Transfer payment with the amount 500 is applied
        Then The payment amount is 1000

    Scenario: 2 Partial Bank Transfer the invoice is final
        When 1 "non-final" Bank Transfer payment with the amount 400 is applied
        When 1 "final" Bank Transfer payment with the amount 600 is applied
        Then The paid invoice has the status "FINAL"
    
    # Scenario: Integral Bank Transfer payment is applied