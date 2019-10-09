Feature: VAT Policies

  Scenario: UK VAT treatment of APC for an UK individual
    Given The Payer is in UK
    And The payer will pay for an APC
    When The invoice net value is 100
    Then The invoice total amount is 120

  Scenario: UK VAT treatment of APC for an UK institution
    Given The Payer is in UK
    And The payer will pay for an APC
    When The invoice net value is 100
    Then The invoice total amount is 120

  Scenario: UK VAT treatment of APC for an EU individual
    Given The Payer is in RO
    And The payer will pay for an APC
    When The invoice net value is 100
    Then The invoice total amount is 120

  Scenario: UK VAT treatment of APC for an EU institution
    Given The Payer is in RO
    And The payer will pay for an APC
    When The invoice net value is 100
    Then The invoice total amount is 119

  Scenario: UK VAT treatment of APC for an Non-EU individual
    Given The Payer is in CH
    And The payer will pay for an APC
    When The invoice net value is 100
    Then The invoice total amount is 100

  Scenario: UK VAT treatment of APC for an Non-EU institution
    Given The Payer is in CH
    And The payer will pay for an APC
    When The invoice net value is 100
    Then The invoice total amount is 100

  Scenario: UK VAT treatment of publication not owned by Hindawi
    Given The Payer is in UK
    And The payer wants to purchase a publication NOT owned by Hindawi
    When The invoice net value is 100
    Then The invoice total amount is 120

  Scenario: UK VAT treatment of the supply of hard copy publications
    Given The Payer is in UK
    And The payer wants to purchase a hard copy
    When The invoice net value is 100
    Then The invoice total amount is 100
