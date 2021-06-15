Feature: Payer Repo

    @ValidateKnexPayerRepo
    Scenario: TestPayer.getPayerById() method
        Given a payer with the id "foo-payer"
        When we call getPayerById for "foo-payer"
        Then getPayerById returns the payer

        Given a payer with the id "foo-payer"
        When we call getPayerById for an un-existent payer "foo-payer2"
        Then getPayerById returns null

    @ValidateKnexPayerRepo
    Scenario Outline: TestPayer.exists()
        Given a payer with the id "foo-payer"
        When we call exists for <payer> payer id
        Then Payer.exists returns <exists>

        Examples:
            | payer      | exists |
            | foo-payer  | true   |
            | foo-payer2 | false  |

    @ValidateKnexPayerRepo
    Scenario: TestPayer.save()
        Given we have an payer object with the id "foo-payer"
        When we call Payer.save on the payer object
        Then the payer object should be saved
