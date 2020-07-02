Feature: Article  Repo

    Scenario: Test Article.findById()
        Given a article with the id "foo-article"
        When we call findById for "foo-article"
        Then findById returns the article

    Scenario: Test Article.findById()
        Given a article with the id "foo-article"
        When we call findById for an un-existent article "foo-article2"
        Then findById returns null

    Scenario Outline: Test Article.exists()
        Given a article with the id "foo-article"
        When we call exists for <article> article id
        Then Article.exists returns <exists>

        Examples:
            | article      | exists |
            | foo-article  | true   |
            | foo-article2 | false  |

    Scenario: Test Article.save()
        Given we have an article object with the id "foo-article"
        When we call Article.save on the article object
        Then the article object should be saved
