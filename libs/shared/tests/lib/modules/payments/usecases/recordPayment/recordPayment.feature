Feature: Payment tests
#   Background:
#     Given There is a Journal "foo-journal" with APC "200"

    
    Scenario: Partial Bank Transfer payment is applied
        When 1 non-final Bank Transfer payment with the amount 500 is applied
        Then The payment amount is 500
    
    # Scenario: Integral Bank Transfer payment is applied