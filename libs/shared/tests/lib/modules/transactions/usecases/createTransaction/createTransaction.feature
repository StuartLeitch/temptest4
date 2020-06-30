Feature: Create Transaction Usecase

    Scenario: Create Transaction
        Given A journal "foo-journal" with the APC of 100
        When CreateTransactionUsecase is executed for manuscript "foo-manuscript"
        Then A DRAFT Transaction should be created
        And A DRAFT Invoice should be created
        And An Invoice Item should be created
        And The Invoice Item should have a price attached equal to 100
