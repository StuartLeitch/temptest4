Feature: Journal Domain Entity

    Scenario: Create Journal
        Given There is a Journal Domain Entity
        When I try to create a Journal called "Test Journal" with an articleProcessingCharge equal to 2000
        Then A new Journal called "Test Journal" with an articleProcessingCharge equal to 2000 is created
