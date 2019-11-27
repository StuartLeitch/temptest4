Feature: Exchange Rate

  Scenario: Get exchange rate on a specific date
    Given The date is 27/07/2018
    And The against currency is USD
    When The exchange rate is queried
    Then The value should be 1.3176
