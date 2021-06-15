Feature: Article Domain Entity

    @ValidateArticle
    Scenario: Create Article
        Given There is an Article Domain Entity
        When The Article.create method is called for a given ID "article-id"
        Then A new Article is successfully created with ID "article-id"

    @ValidateArticle
    Scenario: Mark as Published
        Given There is an Article Domain Entity
        When I try to mark as published an article with ID "article-id" on "2020-01-01"
        Then The published date for the Article with ID "article-id" is successfully updated to "2020-01-01"
