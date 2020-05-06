Feature: VAT Notes Rules
@included
  Scenario: VAT Notes for an UK individual
    Given The Payer is in UK
    When The VAT note is generated
    Then VAT note template should be "UK VAT applies to this invoice, based on the country of the payer. (VAT amount in GBP is {Vat/Rate} GBP, 1 GBP = {Rate} USD)"
    And VAT note tax treatment value should be "a6B0Y000000fyPVUAY"
    And VAT note tax treatment text should be "UK Sale Services"
    And VAT note tax type value should be "a680Y0000000CvBQAU"
    And VAT note tax type text should be "Standard Rate UK"

  Scenario: VAT Notes for an UK institution
    Given The Payer is in UK
    When The VAT note is generated
    Then VAT note template should be "UK VAT applies to this invoice, based on the country of the payer. (VAT amount in GBP is {Vat/Rate} GBP, 1 GBP = {Rate} USD)"
    And VAT note tax treatment value should be "a6B0Y000000fyPVUAY"
    And VAT note tax treatment text should be "UK Sale Services"
    And VAT note tax type value should be "a680Y0000000CvBQAU"
    And VAT note tax type text should be "Standard Rate UK"

  Scenario: VAT Notes for an EU institution
    Given The Payer is in RO
    When The VAT note is generated
    Then VAT note template should be "Outside the scope of UK VAT as per Article 44 of 2006/112/EC"
    And VAT note tax treatment value should be "a6B0Y000000fyOuUAI"
    And VAT note tax treatment text should be "EC Sale Services UK"
    And VAT note tax type value should be "a680Y0000000CvCQAU"
    And VAT note tax type text should be "Zero Rate UK"

  Scenario: VAT Notes for an EU individual
    Given The Payer is in RO
    When The VAT note is generated
    Then VAT note template should be "UK VAT applies to this invoice, based on the country of the payer. (VAT amount in GBP is {Vat/Rate} GBP, 1 GBP = {Rate} USD)"
    And VAT note tax treatment value should be "a6B0Y000000fyPVUAY"
    And VAT note tax treatment text should be "UK Sale Services"
    And VAT note tax type value should be "a680Y0000000CvBQAU"
    And VAT note tax type text should be "Standard Rate UK"

  Scenario: VAT Notes for an Non-EU individual
    Given The Payer is in CH
    When The VAT note is generated
    Then VAT note template should be "Outside the scope of UK VAT as per Article 44 of 2006/112/EC"
    And VAT note tax treatment value should be "a6B0Y000000fyOyUAI"
    And VAT note tax treatment text should be "Worldwide Sale Services"
    And VAT note tax type value should be "a680Y0000000Cv8QAE"
    And VAT note tax type text should be "Exempt UK"

  Scenario: VAT Notes for an Non-EU institution
    Given The Payer is in CH
    When The VAT note is generated
    Then VAT note template should be "Outside the scope of UK VAT as per Article 44 of 2006/112/EC"
    And VAT note tax treatment value should be "a6B0Y000000fyOyUAI"
    And VAT note tax treatment text should be "Worldwide Sale Services"
    And VAT note tax type value should be "a680Y0000000Cv8QAE"
    And VAT note tax type text should be "Exempt UK"



