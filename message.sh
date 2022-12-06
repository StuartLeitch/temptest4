#!/bin/bash

aws sns publish --topic-arn  arn:aws:sns:eu-west-1:916437579680:env-demo-sales-demosalesv2topic7430E247-1E2AMPAIP7QXE --region eu-west-1 --message '{
"event": "pen:hindawi:hindawi-review:SubmissionScreeningPassed",
"data": {
  "submissionId": "549b5dec-3119-4098-a4a5-20131efc4e9d",
  "manuscripts": [
    {
      "customId": "1041480",
      "submissionId": "549b5dec-3119-4098-a4a5-20131efc4e9d",
      "journalId": "2b834ab5-52e0-4b99-a906-6f0f0b1d0a31",
      "title": "4 advances in sdadas",
      "abstract": "abstr",
      "version": "1",
      "conflictOfInterest": "co",
      "dataAvailability": "daa",
      "fundingStatement": "funding s",
      "specialIssueId": null,
      "qualityChecksSubmittedDate": null,
      "id": "bccd897f-a0b6-4106-8698-a3a55586c550",
      "articleType": {
        "name": "Research Article"
      },
      "sectionId": null,
      "submissionCreatedDate": "2022-11-25T08:43:40.708Z",
      "authors": [
        {
          "id": "9513aca9-b075-4a24-8d71-5393024550f0",
          "created": "2022-11-25T08:44:24.704Z",
          "updated": "2022-11-25T08:44:25.363Z",
          "surname": "TaAuthor",
          "givenNames": "Author",
          "email": "author.tae2e@hindawi.com",
          "aff": "Ollscoil na Gaillimhe – University of Galway, Galway",
          "country": "IE",
          "isSubmitting": true,
          "isCorresponding": true,
          "orcidId": ""
        }
      ],
      "files": [
        {
          "id": "c2e503e4-c61d-47d2-92e0-f79ecf1444d5",
          "created": "2022-11-25T08:44:24.704Z",
          "updated": "2022-11-25T08:44:25.125Z",
          "type": "manuscript",
          "fileName": "HindawiAppendix2 - 12May2022.pdf",
          "mimeType": "application/pdf",
          "size": 1005703,
          "originalName": "HindawiAppendix2 - 12May2022.pdf",
          "providerKey": "bccd897f-a0b6-4106-8698-a3a55586c550/bf1c6e08-3820-41b5-8362-9c8ef0fe7829"
        }
      ],
      "editors": []
    }
  ]
}
}'

