Feature: Issn validation test

  Scenario: A new issn is created with a valid code
    When I create a new ISSN with code "0317-8471"
    Then the ISSN is created successfully

  Scenario: A Guard Error is generated when an incorect code is provided
    When I create a new ISSN with code "0317-8475"
    Then a guard error is generated

  Scenario: A Guard Error is generated when poorly formatted a code is provided
    When I create a new ISSN with code "acvf"
    Then a guard error is generated

  Scenario: A new issn is created with a valid code with special control digit
    When I create a new ISSN with code "1050-124X"
    Then the ISSN is created successfully
