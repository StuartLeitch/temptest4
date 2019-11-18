# Invoicing GraphQL

# Event Consuming

## Example

In `queue_service/index.ts`:

```typescript
if (event === 'SubmissionSubmitted') {
  messageQueue.__LOCAL__ = {
    event,
    handler: handler.bind(context)
  };
}
```

In `main.ts`:

```typescript
const test = 'test-manuscript';
queue.__LOCAL__.handler({
  "submissionId":"45a12e90-7143-4af8-acca-b8970946be5c",
  "manuscripts":[{
    "id": "385f6664-5809-4a9b-91c1-ff9afe2d75c4",
    "title": "invoicing test manuscript",
    "created": "2019-11-14T15:31:53.116Z",
    "updated": "2019-11-14T15:32:41.712Z",
    "customId": "5513114",
    "abstract": "sdfsd",
    "version": 1,
    "files": [
        {
            "id": "77e180cc-8284-4b51-8290-2dd32b2b73c8",
            "created": "2019-11-14T15:32:39.494Z",
            "updated": "2019-11-14T15:32:39.494Z",
            "type": "manuscript",
            "label": null,
            "fileName": "02 Revenue Recognition.pdf",
            "url": null,
            "mimeType": "application/pdf",
            "size": 322902,
            "originalName": "02 Revenue Recognition.pdf",
            "position": null,
            "providerKey": "385f6664-5809-4a9b-91c1-ff9afe2d75c4/3c4fcaf3-82da-4cbd-beb0-45f91aae2704"
        }
    ],
    "reviews": [],
    "journalId": "25dc63a9-67f4-4ae1-b41d-a09850263c64",
    "sectionId": null,
    "specialIssueId": null,
    "conflictOfInterest": "",
    "dataAvailability": "sss",
    "fundingStatement": "sss",
    "editors": [
        {
            "id": "1f072c52-9b4e-4556-a424-82f833a04e9c",
            "userId": "445e7273-14dd-4619-9b21-8ff0ead6092a",
            "isCorresponding": null,
            "aff": "Hindawi Research",
            "email": "sabina.deliu+ea@hindawi.com",
            "title": "mrs",
            "country": "RO",
            "surname": "editorialAssistant",
            "givenNames": "EA",
            "role": {
                "type": "editorialAssistant",
                "label": "Editorial Assistant"
            }
        }
    ],
    "authors": [
        {
            "id": "4d772a1e-9927-4b3d-99f9-135530f91bff",
            "created": "2019-11-14T15:32:29.276Z",
            "updated": "2019-11-14T15:32:29.309Z",
            "userId": "6793be84-4124-4c8d-b8ff-85a17226abb5",
            "status": "pending",
            "position": 0,
            "isSubmitting": true,
            "isCorresponding": true,
            "aff": "asd",
            "email": "geo240585@gmail.com",
            "country": "DK",
            "surname": "asdad",
            "givenNames": "adsd"
        }
    ],
    "reviewers": [],
    "articleType": {
        "name": "Research Article"
    }
  }
]});
```
