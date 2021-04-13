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

    Scenario: First PayPal payment
        When 1 PayPal payment is applied
        Then The paid invoice has the status "ACTIVE"
        And The payment is in status "CREATED"

    Scenario: PayPal payment after a previous PayPal paymetn with status CREATED
        Given There is a PayPal payment with the amount 1000 with status "CREATED" and order id "test-2"
        When 1 PayPal payment is applied
        Then The paid invoice has the status "ACTIVE"
        And The payment is in status "CREATED"
        And There is only one payment with the payment proof not equal to "test-2"

    # will be uncommented after we add checks to prevent multiple payments after the invoice is FINAL or if a pending payment exists
    # Scenario: PayPal payment is rejected if a previous PayPal payments is with status PENDING
    #     Given There is a PayPal payment with the amount 1000 with status "PENDING" and order id "test-2"
    #     When 1 PayPal payment is applied
    #     Then The payment recording fails

    Scenario: Full credit card payment
        When 1 Credit Card payment is applied
        Then The paid invoice has the status "FINAL"
