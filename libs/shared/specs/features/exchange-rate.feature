Feature: Exchange Rate

  Scenario: Get exchange rate on a specific date
    Given The against currency is USD
    When The exchange rate is queried
    Then The value should be 1.1763
