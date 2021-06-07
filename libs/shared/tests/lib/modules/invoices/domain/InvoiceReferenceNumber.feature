Feature: Invoice Reference Number
    @referenceNumber
    Scenario Outline: Reference Number persistence matrix with new rules
        Given Invoice number is <invoiceNumber>
        Given The date of manuscript acceptance is <dateAccepted>
        Given The date of confirmation is <dateIssued>
        When The Invoice changes status to <status>
        Then Stored reference number should be <persistentReferenceNumber>

        Examples:
            | status | invoiceNumber | dateAccepted | dateIssued | persistentReferenceNumber |
            | DRAFT  |               |              |            |                           |
            | DRAFT  | 6666          | 2020-12-07   |            |                           |
            | DRAFT  | 542           | 2008-03-13   | 2020-09-16 | 00542/2008                |                          
            | ACTIVE | 6666          | 2020-12-06   | 2020-12-06 | 06666/2020                |
            | ACTIVE | 6666          | 2020-12-15   | 2020-12-15 | 006666/2020               |
            | ACTIVE | 6666          | 2021-04-14   | 2021-04-16 | 006666/2021               |
            | ACTIVE | 6666          | 2021-12-06   | 2021-12-06 | 006666/2022               |
            | ACTIVE | 99999         | 2021-12-06   | 2021-12-06 | 099999/2022               |
            | ACTIVE |               | 2021-10-29   | 2020-11-23 |                           |
            | ACTIVE |               |              | 2020-07-22 |                           |
            | FINAL  | 6666          | 2020-12-06   | 2020-12-06 | 06666/2020                |
            | FINAL  | 6666          | 2020-12-15   | 2020-12-15 | 006666/2020               |
            | FINAL  | 66666         | 2021-04-14   | 2021-04-16 | 066666/2021               |
            | FINAL  | 66666         | 2021-12-06   | 2021-12-06 | 066666/2022               |
            | FINAL  | 99999         | 2021-12-06   | 2021-12-06 | 099999/2022               |
            | FINAL  | 100000        | 2021-12-06   | 2021-12-06 | 100000/2022               |
            | FINAL  |               | 2016-03-29   | 2016-03-29 |                           |
