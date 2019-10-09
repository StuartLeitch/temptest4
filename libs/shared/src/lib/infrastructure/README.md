# Infrastructure

> The **infrastructure** contains the code that adapts the tools/libraries to the application core needs.

Our application uses several tools (libraries and 3rd party applications), for example an ORM, a message queue, or an SMS provider.

Furthermore, for each of these tools we might need to have several implementations.

For example, consider the case where a company expands to another country and for pricing reasons its better to use a different SMS provider in each country: we will need different adapter implementations using the same port so they can be used interchangeably.

Another case is when we are refactoring the database schema, or even switching the DB engine, and need (or decide) to also switch to another ORM: then we will have 2 ORM adapters hooked into our application.

So within the **Infrastructure** namespace we start by creating a namespace for each tool type (ORM, MessageQueue, SmsClient), and inside each of those we create a namespace for each of the adapters of the vendors we use (Doctrine, Propel, MessageBird, Twilio, …).

```sh
<infrastructure namespace>/
├── command-bus/ # implementation of the adapters that adapt a 3rd party tool to a core port.
│    └── <vendor-adapter>/
├── event-bus/
├── notifications/
├── search/
└── persistence/
     ├── <Postgres-adapter>/
     ├── <MS SQL-adapter>/
     └── <SQLite3-adapter>/
```
