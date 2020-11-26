Feature: Publish revenue recognition reversal to Netsuite

Background: 
    Given A regular invoice 
   
Scenario: Revenue Recognition Reversal for Invoice
    When Reversal usecase executes for Invoice
    Then Reversal created in Netsuite for Invoice
