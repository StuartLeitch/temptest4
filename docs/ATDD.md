# ATDD

! **Keep your tests clean. Treat them as first-class citizens of the system.**

## Definitions

### Unit Test

> A test written by a programmer for the purpose of ensuring that the production code does what the programmer expects it to do. (For the moment we will ignore the notion that unit tests also aid the design, etc.)

### Acceptance Test

> A test written by the business for the purpose of ensuring that the production code does what the business expects it to do. The authors of these tests are business people, or technical people who represent the business. i.e. Business Analysts, and QA.

### Integration Test

> A test written by architects and/or technical leads for the purpose of ensuring that a sub-assembly of system components operates correctly. These are plumbing tests. They are not business rule tests. Their purpose is to confirm that the sub-assembly has been integrated and configured correctly.

### System Test

> An integration test written for the purpose of ensuring that the internals of the whole integrated system operate as planned. These are plumbing tests. They are not business rule tests. Their purpose is to confirm that the system has been integrated and configured correctly.

### Micro-test

> A term coined by Mike Hill (@GeePawHill). A unit test written at a very small scope. The purpose is to test a single function, or small grouping of functions.

### Functional Test

> A unit test written at a larger scope, with appropriate mocks for slow components.

## Testing UseCases

A UseCase contains the application logic for a single **action** or **activity** that our system supports. For instance, **cancel a payment**. This application logic interacts with the domain and various services. These services and the domain should have their own unit and integration tests.

Each `UseCase` gets used in one or more applications, where it gets invoked from inside the presentation layer. Typically you want to have a few integration or edge-to-edge tests that cover this invocation.

### Integration Testing

One way to deal with this is to write **integration tests** for your UseCases. Simply get an instance of the UseCase from your Top Level Factory or Dependency Injection Container.

This approach often requires you to mutate the factory or DIC. Want to test that an exception from the persistence service gets handled properly? You’ll need to use some `test double` instead of the real service, or perhaps mutate the real service in some way. Want to verify a mail got send? Definitely want to use a `Spy` here instead of the real service. Mutability comes with a cost so is better avoided.

A second issue with using real collaborators is that your tests get slow due to real persistence usage. Even using an in-memory SQLite database (that needs initialization) instead of a simple in-memory fake repository makes for a speed difference of easily two orders of magnitude.

### Unit Testing

Unit Tests are able to break these rules of acceptance tests.
It is meant to serve as documentation of the behavior of lower level components.
Since these tests are lower level it is possible to test-drive the system into performing every possible permutation of behavior under a test situation.

This gives the property of [(semantic stability)](https://www.madetech.com/blog/semantically-stable-test-suites) .

While there might be some cases where integration tests make sense, normally it is better to write unit tests for UseCases. This means having test doubles for all collaborators. Which leads us to the question of how to best inject these test doubles into our UseCases.

As example I will use the `CancelMembershipApplicationUseCase`:

```ts
constructor(authorizer: ApplicationAuthorizer, repository: ApplicationRepository , mailer: TemplateMailerInterface) {
    this.authorizer = authorizer;
    this.repository = repository;
    this.mailer = mailer;
}
```

This UseCase uses 3 collaborators. An **authorization service**, a **repository** (persistence service) and a **mailing service**. First it checks if the operation is allowed with the authorizer, then it interacts with the persistence and finally, if all went well, it uses the mailing service to send a confirmation email. Our unit test should test all this behavior and needs to inject test doubles for the 3 collaborators.

### Acceptance Testing

The purpose of acceptance testing is to test an entire system via it's boundary only.
It serves as a *stand-in*, and documentation for the implementation of the future UI of your system.
Anything that you are coupled to in your acceptance tests, you are also going to be coupled to in your UI.

This means an acceptance test, cannot depend on the following types of objects:

- Domain objects
- Gateways

It must only depend on the *Boundary* of your system.

**The purpose of acceptance tests** is to measure success towards the goal of meeting the customer's needs, and reduces the occurrence of gold plating.
