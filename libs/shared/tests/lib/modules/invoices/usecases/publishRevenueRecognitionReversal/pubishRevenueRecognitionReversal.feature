Feature: Publish revenue recognition reversal to Netsuite

Background: 
    Given A regular invoice 
   
Scenario: Revenue Recognition Reversal for Invoice
    And The payer is from "RO" and an "INDIVIDUAL"
    When Reversal usecase executes for Invoice
    Then Reversal created in Netsuite for Invoice

Scenario: Revenue Recognition Reversal for discounted Invoice
    And The payer is from "RO" and an "INSTITUTION"
    And A Discount of 100% for Invoice
    When Reversal usecase executes for Invoice 
    Then Reversal created in Netsuite for Invoice 
    Then The Invoice amount is 0

Scenario: Revenue Recognition Reversal for VAT Invoice
    And The payer is from "GB" and an "INDIVIDUAL"
    And A VAT of 20% for Invoice
    When Reversal usecase executes for Invoice
    Then Reversal created in Netsuite for Invoice
    Then The Invoice amount is 120

